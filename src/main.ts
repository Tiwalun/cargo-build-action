import * as core from '@actions/core'
import * as exec from '@actions/exec'

async function run(): Promise<void> {
  try {
    const command: string = core.getInput('command')

    const arguments_input: string = core.getInput('arguments')

    core.debug(`Running command 'cargo ${command} ${arguments_input}'`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    const cargo_arguments: [string] = [command]

    if (arguments_input.length > 0) {
      cargo_arguments.push(arguments_input)
    }

    exec.exec('cargo', cargo_arguments)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
