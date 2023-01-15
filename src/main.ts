import * as core from '@actions/core'
import * as exec from '@actions/exec'

async function run(): Promise<void> {
  try {
    const command: string = core.getInput('command')
    core.debug(`Running command 'cargo ${command}'`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    exec.exec('cargo', [command])
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
