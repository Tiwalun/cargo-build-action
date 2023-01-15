import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {Writable} from 'stream'

interface CargoJson {
  reason: string
}

interface RustcDiagnosticCode {
  code: string
  explanation?: string
}

interface RustcSpan {
  file_name: string
  line_start: number
  line_end: number
  column_start: number
  column_end: number
  is_primary: boolean
}

interface RustcMessage {
  message: string
  code: RustcDiagnosticCode
  level: string
  spans: [RustcSpan]
  rendered: string
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

          const message = compiler_message.message

          if (message.level === 'warning') {
            for (const span of message.spans) {
              // TODO: Multiple primary spans
              // TODO: Non-primary spans
              if (span.is_primary) {
                const properties: core.AnnotationProperties = {
                  title: message.message,
                  startLine: span.line_start,
                  endLine: span.line_end,
                  startColumn: span.column_start,
                  endColumn: span.column_end
                }
                core.warning(message.rendered, properties)
              }
            }
          } else {
            core.debug(`Ignoring compiler message with level ${message.level}`)
          }
        }
      }
    }

    core.error(
      '\u001b[0m\u001b[1m\u001b[33mwarning\u001b[0m\u001b[0m\u001b[1m: test ascii stuffs here\u001b[0m\n\n'
    )

    await exec.exec('cargo', cargo_arguments, options)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
