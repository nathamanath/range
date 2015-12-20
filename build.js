({
  baseUrl: './source',
  name: 'main',
  mainConfigFile: 'source/main.js',
  deps: [
    'main'
  ],
  optimize: 'none',
  removeCombined: true,
  findNestedDependencies: true,
  out: 'build/range.js',
  preserveLicenseComments: true,
  wrap: {
    startFile: 'source/_start.js',
    endFile: 'source/_end.js'
  },
  onModuleBundleComplete: function (data) {
    var fs = module.require('fs'),
      amdclean = module.require('amdclean'),
      outputFile = data.path,
      cleanedCode = amdclean.clean({
        filePath: outputFile,
        transformAMDChecks: false,
        wrap: {
          start: '',
          end: ''
        }
      });

    fs.writeFileSync(outputFile, cleanedCode);
  }
})
