// /$$$$$$$$                                            /$$     /$$
// | $$_____/                                           | $$    | $$
// | $$     /$$$$$$   /$$$$$$  /$$$$$$/$$$$   /$$$$$$  /$$$$$$ /$$$$$$    /$$$$$$   /$$$$$$   /$$$$$$$
// | $$$$$ /$$__  $$ /$$__  $$| $$_  $$_  $$ |____  $$|_  $$_/|_  $$_/   /$$__  $$ /$$__  $$ /$$_____/
// | $$__/| $$  \ $$| $$  \__/| $$ \ $$ \ $$  /$$$$$$$  | $$    | $$    | $$$$$$$$| $$  \__/|  $$$$$$
// | $$   | $$  | $$| $$      | $$ | $$ | $$ /$$__  $$  | $$ /$$| $$ /$$| $$_____/| $$       \____  $$
// | $$   |  $$$$$$/| $$      | $$ | $$ | $$|  $$$$$$$  |  $$$$/|  $$$$/|  $$$$$$$| $$       /$$$$$$$/
// |__/    \______/ |__/      |__/ |__/ |__/ \_______/   \___/   \___/   \_______/|__/      |_______/

const models = require('shr-models');
const fs = require('fs');
const mkdirp = require('mkdirp');

const { NamespaceFormatter } = require('./formatters/namespaceFormatter');
// const { MappingFormatter } = require('./formatters/mappingFormatter');
// const { ValueSetFormatter } = require('./formatters/valueSetFormatter');
// const { NamespaceFormatter } = require('./formatters/namespaceFormatter');

class CimplExporter {
  constructor(specs) {
    this._specs = specs;
    this._namespaces = specs.namespaces.all;
    this._elements = specs.dataElements.all;
    this._valuesets = specs.valueSets.all;
    this._mappings = specs.maps.targets.reduce((out, target) => { out[target] = specs.maps.byTarget(target); return out; }, {});
  }

  get namespaces() { return this._namespaces; }
  get elements() { return this._elements; }
  get valuesets() { return this._valuesets; }
  get mappings() { return this._mappings; }


  findOrigDef(el, filePath) {
      // const ns = el.identifier.namespace.split('.').join('_');
      // const file = fs.readFileSync(filePath + '/' + ns + '.txt', 'utf8').split('\n');
      // let abstract = el.isAbstract;
      // let entry = el.isEntry;
      // for (let line of file) {
      //   if (line.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*/, '').match(new RegExp(`\\s*${(abstract) ? 'Abstract' : (entry) ? 'Entry' : ''}\\s*Element:\\s*${el.identifier.name}\\s*$`))) {

      //     let i = file.indexOf(line);
      //     let j = i;
      //     while (j < file.length) {
      //       let stripped = file[j].replace(/\s/g, '').replace(/^\/\*.*/, '');
      //       if (stripped.length == 0) {
      //         return file.slice(i, j);
      //       } else if (j == file.length - 1) {
      //         return file.slice(i, j + 1);
      //       }

      //       j++;
      //     }
      //   } else {
      //     continue;
      //   }
      // }
  }

  compareSimilarity(orig, out) {
      // let similarLines = 0;
      // let strippedOrig = orig.map(ln =>
      //   ln.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*/, '')
      //     .replace(/^\/\*.*/, '')
      //     .replace('FHIR/', 'http://hl7.org/fhir/ValueSet/')
      //     .replace(/\s/g, '')
      //     .replace(/ref\(([^\(\)]*)\)/, `$1`)
      //     .replace(/valueistype/, 'istype')
      //     .replace(/Valueistype/, 'istype')
      //     .replace(/Value:([A-Za-z]*)istype/, 'istype')
      // );
      // strippedOrig = strippedOrig.filter(ln =>
      //   ln !== 'Concept:TBD'
      //   && ln !== 'Description:""'
      //   && ln !== ''
      //   && !ln.startsWith('/*')
      // );

      // let strippedOut = [];
      // out.map(ln => ln.split('\n')).forEach(a => strippedOut.push(...a));
      // strippedOut = strippedOut.map(ln =>
      //   ln.replace(/\s/g, '')
      //     .replace(/http:\/\/standardhealthrecord.org\/shr\/[A-Za-z]*\/cs\/#[A-Za-z]*CS/g, '')
      //     .replace(/ref\(([^\(\)]*)\)/, `$1`)
      //     .replace(/\.([A-Za-z]*)istype/, 'istype')
      //     .replace(/valueistype/, 'istype')
      //     .replace(/Value:([A-Za-z]*)istype/, 'istype')
      // );

      // let totalLines = Math.max(strippedOrig.length, strippedOut.length);
      // let strippedOutClone = strippedOut.map(a => a);

      // for (const line of strippedOut) {
      //   if (strippedOrig.indexOf(line) > -1) {
      //     similarLines += 1;
      //     strippedOrig = strippedOrig.filter(a => a != line);
      //     strippedOutClone = strippedOutClone.filter(a => a != line);
      //   }
      // }

      // //linting formatting filters
      // for (const line of strippedOut) {
      //   let match = strippedOrig.find(ln => ln.indexOf(line) > -1);
      //   if (strippedOutClone.indexOf(line) > -1 && match && match.replace(/^[0-9]..[0-9]/,'') == line) {
      //     similarLines += 1;
      //     strippedOrig = strippedOrig.filter(a => a != match);
      //     strippedOutClone = strippedOutClone.filter(a => a != line);
      //   }
      // }

      // for (const line of strippedOut) {
      //   let match = strippedOrig.find(ln => ln.indexOf(line) > -1 && ln.indexOf('includes'));
      //   let index = strippedOutClone.indexOf(line);
      //   if (index < strippedOutClone.length - 1 && [line, strippedOutClone[index + 1]].join('') == match) {
      //     similarLines += 2;
      //     strippedOrig = strippedOrig.filter(a => a != match);
      //     strippedOutClone = strippedOutClone.filter(a => a != line && a != strippedOutClone[index + 1]);
      //   }
      // }



      // let per = Math.floor(similarLines / totalLines * 100);
      // return [`${per}% similar, ${totalLines - similarLines} dissimilar lines`, per, strippedOrig, strippedOutClone];
  }

  checkEfficacy(e, v, m, expSpecs) {
      // if (e) {
      //   e.forEach(element => {
      //     if (!namespaces[element.identifier.namespace]) {
      //       namespaces[element.identifier.namespace] = [];
      //     }

      //     let breakname;
      //     breakname = 'ContraceptiveMethodRequestedAgainst';
      //     if (element.identifier.name == breakname) {
      //       let stop = 'here';
      //     }

      //     let origDef = findOrigDef(expSpecs.dataElements.all.find(el => el.identifier.name == element.identifier.name)) || [];
      //     let outDef = exporter.deFormatter.formatDataElementOutput(element) || [];

      //     namespaces[element.identifier.namespace].push(outDef);

      //     let sim = compareSimilarity(origDef, outDef);
      //     if (sim[1] != 100) {
      //       // console.log('------------------------------------------------------')
      //       // console.log('\n(original)\n')
      //       // console.log(origDef.join('\n'));
      //       // console.log('\ndifferent lines:')
      //       // console.log(sim[2].join('\n'));

      //       // console.log('\n(exported) %s\n', sim[0]);
      //       // console.log(outDef.join('\n'));
      //       // console.log('\ndifferent lines:')
      //       // console.log(sim[3].join('\n'));
      //       // console.log();
      //     }
      //     totalPer = [totalPer[0] + (sim[1] == 100 ? 1 : 0), totalPer[1] + 1];
      //   });
      // }

      // if (v) {
      //   let totalPercent = 0;
      // v.forEach(valueset => {
      //   let origDef = this.findOrigDef(expSpecs.valuesets.all.find(vs => vs.identifier.name == valueset.identifier.name)) || [];
      //   let outDef = this.vsFormatter.formatDataElementOutput(element) || [];

      //   namespaces[element.identifier.namespace].push(outDef);

      //   let sim = compareSimilarity(origDef, outDef);
      //   if (sim[1] != 100) {
      //     // console.log('------------------------------------------------------')
      //     // console.log('\n(original)\n')
      //     // console.log(origDef.join('\n'));
      //     // console.log('\ndifferent lines:')
      //     // console.log(sim[2].join('\n'));

      //     // console.log('\n(exported) %s\n', sim[0]);
      //     // console.log(outDef.join('\n'));
      //     // console.log('\ndifferent lines:')
      //     // console.log(sim[3].join('\n'));
      //     // console.log();
      //   }
      //   totalPer = [totalPer[0] + (sim[1] == 100 ? 1 : 0), totalPer[1] + 1];
      // });
      // }

      // if (m) {

      // }


      // for (const name in namespaces) {

      // }

      // console.log(`${totalPer[0]}/${totalPer[1]} cases equilavent`);

  }


  exportNamespaceToPath(ns, path) {
    const nsDataElements = this.elements.filter(de => de.identifier.namespace == ns); // this.specs.dataElements.byNamespace(ns);
    const nsValueSets = this.valuesets.filter(vs => vs.identifier.namespace == ns); // this.specs.dataElements.byNamespace(ns);
    const nsMappings = Object.keys(this.mappings).reduce((out, target) => {
      out[target] = this.mappings[target].filter(m => m.identifier.namespace == ns);
      return out;
    }, {}); // despite its current complexity, alternative ways to reach mappings were even more complex

    const currentNS = this.namespaces.find(n => n.namespace == ns);

    const nsFormatter = new NamespaceFormatter(currentNS, this.specs, nsDataElements, nsValueSets, nsMappings);

    if (nsDataElements.length > 0) {
      const formattedDataElementFile = nsFormatter.formatDataElementFile();
      this.exportDataElementFileToNamespace(formattedDataElementFile, ns, path);
    }

    if (nsValueSets.length > 0) {
      const formattedValueSetFile = nsFormatter.formatValueSetFile();
      this.exportValueSetFileToNamespace(formattedValueSetFile, ns, path);
    }

    const totalNSMappingsCount = Object.keys(nsMappings).reduce((count, target) => count + nsMappings[target].length, 0);
    if (totalNSMappingsCount > 0) {
      for (const target in nsMappings) {
        if (nsMappings[target].length > 0) {
          const formattedMappingsFile = nsFormatter.formatMappingsFile(target);
          this.exportMappingsFileToNamespace(formattedMappingsFile, ns, path);
        }
      }
    }
  }

  exportDataElementFileToNamespace(file, namespace, filePath) {
    let ns = namespace.replace(/\./, '_');

    const hierarchyPath = `${filePath}/${ns}.txt`;
    mkdirp.sync(hierarchyPath.substring(0, hierarchyPath.lastIndexOf('/')));
    fs.writeFileSync(hierarchyPath, file);
  }

  exportValueSetFileToNamespace(file, namespace, filePath) {
    let ns = namespace.replace(/\./, '_');

    const hierarchyPath = `${filePath}/${ns}_vs.txt`;
    mkdirp.sync(hierarchyPath.substring(0, hierarchyPath.lastIndexOf('/')));
    fs.writeFileSync(hierarchyPath, file);
  }

  exportMappingsFileToNamespace(file, namespace, filePath) {
    let ns = namespace.replace(/\./, '-');
    const hierarchyPath = `${filePath}/${ns}_map.txt`;
    mkdirp.sync(hierarchyPath.substring(0, hierarchyPath.lastIndexOf('/')));
    fs.writeFileSync(hierarchyPath, file);
  }
}


module.exports = { CimplExporter };