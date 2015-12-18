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
  onModuleBundleComplete: function (data) {
    var fs = module.require('fs'),
      amdclean = module.require('amdclean'),
      outputFile = data.path,
      cleanedCode = amdclean.clean({
        'filePath': outputFile,
        'transformAMDChecks': false,

        'wrap': {
          'start':
            "/** Range.js 0.0.17 | License: MIT */\n" +
            ";(function (root, factory) { \n  if (typeof define === 'function' && define.amd) { \n    define(factory); \n  } else { \n    root.Range = factory(); \n  } \n}(this, function() {\n'use strict';\n",
          'end': "\n  return main;\n}));\n"
        }
      });

    fs.writeFileSync(outputFile, cleanedCode);
  }
})
