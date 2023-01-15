import {wait} from '../src/wait'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'

test('throws invalid number', async () => {
  const input = parseInt('foo', 10)
  await expect(wait(input)).rejects.toThrow('milliseconds not a number')
})

test('wait 500 ms', async () => {
  const start = new Date()
  await wait(500)
  const end = new Date()
  var delta = Math.abs(end.getTime() - start.getTime())
  expect(delta).toBeGreaterThan(450)
})

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  // Set input arguments
  process.env['INPUT_COMMAND'] = 'build'

  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const work_dir = path.join(__dirname, '..', 'test_data', 'bin_ok')

  const options: cp.ExecFileSyncOptions = {
    env: process.env,
    cwd: work_dir
  }
  console.log(cp.execFileSync(np, [ip], options).toString())
})
