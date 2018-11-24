import { terser } from "rollup-plugin-terser";


export default [{
   input: 'src/SuperMidi.js',
   output: {
     file: 'dist/lib/SuperMidi.js',
     format: 'esm',
     name: 'SuperMidi'
   }
 },
 {
   input: 'src/SuperMidi.js',
   output: {
     file: 'dist/lib/SuperMidi.min.js',
     format: 'esm',
     name: 'SuperMidi'
   }
   ,plugins: [terser()]
 }
]
