import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {Writable} from 'stream'

interface CargoJson {
  reason: string
}

interface RustcMessage {
  message: string
  level: string
}

interface CargoCompilerMessage extends CargoJson {
  package_id: string
  manifest_path: string
  message: RustcMessage
}

async function run(): Promise<void> {
  try {
    const command: string = core.getInput('command')

    const arguments_input: string = core.getInput('arguments')

    core.debug(`Running command 'cargo ${command} ${arguments_input}'`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    const cargo_arguments: [string] = [command]

    if (arguments_input.length > 0) {
      cargo_arguments.push(arguments_input)
    }

    /* eslint-disable @typescript-eslint/no-unused-vars */
    const dummy_stream = new Writable({
      write(_chunk, _encoding, _callback) {}
    })
    /* eslint-enable @typescript-eslint/no-unused-vars */

    // TODO: Check if a existing message-format argument is present
    cargo_arguments.push('--message-format=json-diagnostic-rendered-ansi')

    const options: exec.ExecOptions = {}
    //options.outStream = dummy_stream
    //options.errStream = process.stderr

    options.listeners = {
      stdline: (line: string) => {
        const cargo_output: CargoJson = JSON.parse(line)

        if (cargo_output.reason === 'compiler-message') {
          const compiler_message: CargoCompilerMessage = JSON.parse(line)

          if (compiler_message.message.level === 'warning') {
            core.warning(compiler_message.message.message)
          } else {
            core.debug(
              `Ignoring compiler message with level ${compiler_message.message.level}`
            )
          }
        }
      }
    }

    await exec.exec('cargo', cargo_arguments, options)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
