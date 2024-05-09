import {readFileSync} from 'node:fs'
import {exec, spawn, spawnSync} from 'child_process'
import * as fs from "node:fs";

let depList = []
const projectRoot = 'C:\\Users\\Michael\\Projects\\pnpm-test\\packages\\test2'

const result = await new Promise((resolve, reject) => {

    exec('pnpm ls --parseable --depth Infinity', {
        cwd: projectRoot
    }, (err, stdout, stderr) => {

        if (err) {
            reject(err)
        }

        if (stderr) {
            console.log(stderr)
        }

        resolve(stdout)


    })
})

console.time('packing')
depList = result.trim().split('\n')
const set = new Set(depList.filter(x => x !== projectRoot))

for (const dep of set) {
    console.log('workingdir: ' + dep)
    const p = spawnSync('pnpm pack --pack-destination C:\\Users\\Michael\\Projects\\offline-packager\\exported', {
        cwd: dep,
        stdio: 'inherit',
        shell: true
    })
}

console.timeEnd('packing')

// while(currentDeps) {
//     currentDeps = getDependencies(currentDeps)
//
//
// }


// const getDependencies(tree) => {
//     const deps = []
//     if(tree.dependencies) {
//         for(const dep in tree.dependencies) {
//             deps.push(dep.path)
//
//         }
//     }
//
//     return undefined
// }