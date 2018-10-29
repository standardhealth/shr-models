//  /$$$$$$$              /$$               /$$$$$$$$ /$$                                               /$$
// | $$__  $$            | $$              | $$_____/| $$                                              | $$
// | $$  \ $$  /$$$$$$  /$$$$$$    /$$$$$$ | $$      | $$  /$$$$$$  /$$$$$$/$$$$   /$$$$$$  /$$$$$$$  /$$$$$$   /$$$$$$$
// | $$  | $$ |____  $$|_  $$_/   |____  $$| $$$$$   | $$ /$$__  $$| $$_  $$_  $$ /$$__  $$| $$__  $$|_  $$_/  /$$_____/
// | $$  | $$  /$$$$$$$  | $$      /$$$$$$$| $$__/   | $$| $$$$$$$$| $$ \ $$ \ $$| $$$$$$$$| $$  \ $$  | $$   |  $$$$$$
// | $$  | $$ /$$__  $$  | $$ /$$ /$$__  $$| $$      | $$| $$_____/| $$ | $$ | $$| $$_____/| $$  | $$  | $$ /$$\____  $$
// | $$$$$$$/|  $$$$$$$  |  $$$$/|  $$$$$$$| $$$$$$$$| $$|  $$$$$$$| $$ | $$ | $$|  $$$$$$$| $$  | $$  |  $$$$//$$$$$$$/
// |_______/  \_______/   \___/   \_______/|________/|__/ \_______/|__/ |__/ |__/ \_______/|__/  |__/   \___/ |_______/



const { rightPad, idFromFQN } = require('./commons');

const DEFAULT_MAX_PLACE = 20;
const DEFAULT_MAX_RIGHT_PAD = 4;

class DataElementFormatterCimpl6 {
  constructor(specs) {
    this._specs = specs;
    this._codesystems = [];
    this._uses = [];
    // this._namespaces = namespaces;
    // this._elements = elements;
    // this._valuesets = valuesets;
    this._codesystems = [];
    this._maxPlacement = DEFAULT_MAX_PLACE;
    this._maxRightPad = DEFAULT_MAX_RIGHT_PAD;
  }

  get specs() { return this._specs; }

  get codesystems() { return this._codesystems; }
  get uses() { return this._uses; }
  get maxPlacement() { return this._maxPlacement; }
  set maxPlacement(maxPlacement) { this._maxPlacement = maxPlacement; }
  get maxRightPad() { return this._maxRightPad; }
  set maxRightPad(maxRightPad) { this._maxRightPad = maxRightPad; }

  reset() {
    this._codesystems = [];
    this._paths = [];
    this._maxPlacement = DEFAULT_MAX_PLACE;
    this._maxRightPad = DEFAULT_MAX_RIGHT_PAD;
  }

  shFromCodeSystem(cs) {
    // const shorthand = shorthan,dFromCodesystem(cs);
    if (!cs) return '';

    if (cs.match(/http:\/\/standardhealthrecord.org\/shr\/[A-Za-z]*\/cs\/(#[A-Za-z]*CS)/)) {
      return '';
    }

    const shorthands = {
      'https://sdt.cap.org': 'CAP',
      'http://www.dsm5.org/': 'DSM',
      'https://evs.nci.nih.gov/ftp1/CDISC/SDTM/': 'NCI',
      'http://www.genenames.org': 'HGNC',
      'http://hl7.org/fhir/quantity-comparator': 'UGLY',
      'http://hl7.org/fhir/sid/cvx': 'CVX',
      'http://hl7.org/fhir/allergy-verification-status': 'AVS',
      'http://hl7.org/fhir/observation-status': 'OBS',
      'http://hl7.org/fhir/ValueSet/allergy-intolerance-category': 'AIC',
      'http://hl7.org/fhir/ValueSet/allergy-intolerance-type': 'AIT',
      'http://hl7.org/fhir/observation-category': 'OBSCAT',
      'http://hl7.org/fhir/v3/ActReason': 'V3',
      'http://loinc.org': 'LNC',
      'http://www.meddra.org': 'MDR',
      'http://www.nationsonline.org/oneworld/country_code_list': 'CC',
      'https://www.ncbi.nlm.nih.gov/refseq': 'REFSEQ',
      'http://ncimeta.nci.nih.gov': 'MTH',
      'https://ncit.nci.nih.gov/ncitbrowser/ConceptReport.jsp?dictionary=NCI_Thesaurus': 'NCIT',
      'http://www.nlm.nih.gov/research/umls/rxnorm': 'RXN',
      'http://snomed.info/sct': 'SCT',
      'http://unitsofmeasure.org': 'UCUM',
      'http://uts.nlm.nih.gov/metathesaurus': 'MTS',
      'urn:iso:std:iso:4217': 'CURRENCY',
      'urn:tbd': 'TBD'
    };

    if (shorthands[cs]) {
      if (cs != 'urn:tbd') {
        this._codesystems.pushNew(cs);
      }

      return shorthands[cs];
    } else {
      return cs;
    }
  }

  getIdFromFqnAndTrackUsed(fqn) {
    const id = idFromFQN(fqn);
    if (id.namespace != 'primitive') {
      this.uses.pushNew(id.namespace);
    }

    return id;
  }

  getVSFromURIAndTrackUsed(vs) {
    const ns = vs.match(/standardhealthrecord\.org\/(.*)\/vs\/#[A-Za-z0-9]*/)[1].replace('/', '.');
    this.uses.pushNew(ns);

    const name = vs.split('/').pop().replace('#', '');
    return name;
  }

  formattedCodeFromCncpt(concept) {
    var formattedConceptCode = `${this.shFromCodeSystem(concept.system)}#${concept.code}`;
    if (concept.display) {
      formattedConceptCode = `${formattedConceptCode} "${concept.display}"`;
    } else if (concept.description) {
      formattedConceptCode = `${formattedConceptCode} "${concept.description}"`;
    }

    return formattedConceptCode;
  }

  formatDataElement(de) {
    var declaration, concepts, basedOns, description, value;
    let outputs = [];

    declaration = this.formatDeclaration(de);
    outputs.push(declaration);

    if ('basedOn' in de && de.basedOn.length > 0) {
      basedOns = this.formatBasedOns(de);
      outputs.push(basedOns);
    }

    if ('concepts' in de && de.concepts.length > 0) {
      concepts = this.formatConcepts(de);
      outputs.push(concepts);
    }

    if (de.description) {
      description = this.formatDescription(de);
      outputs.push(description);
    }

    if (de.value && de.value.inheritance != 'inherited') {
      value = this.formatValue(de.value, de, false);
      outputs.push(value);
    }

    if ('fields' in de && de.fields.length > 0) {
      const fields = this.formatFields(de);
      if (fields.length > 0) outputs.push(...fields);
    }

    return outputs.join('\r\n');
  }

  formatDeclaration(de) {
    let formattedModifier = '';
    if (de.isEntry) {
      formattedModifier = 'Entry';
    } else if (de.isAbstract) {
      formattedModifier = 'Abstract';
    }
    else {
      const formattedTitle = `${rightPad(`${formattedModifier}Element:`, this.maxPlacement - 7 - formattedModifier.length)}${de.identifier.name.trim()}`;
      return formattedTitle;
    }
    const formattedTitle = `${rightPad(`${formattedModifier}:`, this.maxPlacement - 1 - formattedModifier.length)}${de.identifier.name.trim()}`;
    return formattedTitle;
  }

  formatBasedOns(de) {
    const formattedBasedOns = [];
    for (const basedOn of de.basedOn) {

      const formattedBasedOn = this.getIdFromFqnAndTrackUsed(basedOn.fqn).name;
      formattedBasedOns.push(formattedBasedOn);
    }
    return `${rightPad('Parent:', this.maxPlacement - 7)}${formattedBasedOns.join(', ')}`;
  }

  formatConcepts(de) {
    const formattedConcepts = [];
    for (const concept of de.concepts) {
      const formattedConcept = `${this.formattedCodeFromCncpt(concept)}`;
      formattedConcepts.push(formattedConcept);
    }
    return `${rightPad('Concept:', this.maxPlacement - 7)}${formattedConcepts.join(', ')}`;
  }

  formatDescription(de) {
    const formattedDesc = `${rightPad('Description:', this.maxPlacement - 10)}"${de.description.trim()}"`;
    return formattedDesc;
  }

  arrangeValuesByConstraintPaths(value, de) {
    var constraintsByPaths = value.constraints.reduce((out, constraint, i) => {
      if (constraint.lastModifiedBy.fqn != de.identifier.fqn) {
        return out;
      }

      let combinedPaths = [];

      if (constraint.path.length > 0) {

        let pathsClone = [...constraint.path];

        while (pathsClone.length > 0) {
          const p = pathsClone.shift();

          if (p.fqn) this.getIdFromFqnAndTrackUsed(p.fqn);

          if (p.name == 'Units' && pathsClone.length > 1 && pathsClone[1].name == 'Coding') {
            pathsClone.shift();
            continue;
          }

          if (['code', 'Coding'].includes(p.name)) {
            continue;
          }

          combinedPaths.push(p.name);
        }
      }

      let combinedPath = (combinedPaths.length > 0) ? combinedPaths.join('.') : 'root';

      if (!out[combinedPath]) out[combinedPath] = [];
      out[combinedPath].push(constraint);

      return out;
    }, {});

    // if (!value.inheritance && Object.keys(out).filter(key=>key!='root').length > 0) {

    // }

    if (Object.keys(constraintsByPaths).length && Object.keys(constraintsByPaths)[0] == 'CodeableConcept') {
      constraintsByPaths = {'root':constraintsByPaths['CodeableConcept']};
    }

    return constraintsByPaths;
  }

  formatFields(de) {
    const formattedFields = [];
    const constrainedFields = [];
    for (const f of de.fields) {
      if (f.inheritance != 'inherited') {
        const constraintsByPaths = this.arrangeValuesByConstraintPaths(f, de);
        if (Object.keys(constraintsByPaths).length > 0) {
          for (const path in constraintsByPaths) {
            const fClone = f.clone();
            fClone.constraints = constraintsByPaths[path];
            let inserted_value = this.formatValue(fClone, de, true, path);
            if (f.inheritance == 'overridden') {
              constrainedFields.push(inserted_value.trim())
            }
            else {
              if (fClone.constraints.length > 0) {
                formattedFields.push('Property:          ' + fClone.identifier.name + ' ' + fClone.card.toString());
                let i = 0;
                for (i = 0; i < fClone.constraints.length; i++) {
                  if(fClone.identifier.name == 'TopicCode') {
                  }
                  if (fClone.constraints[i].valueSet !== undefined) {
                    formattedFields.push(fClone.identifier.name + ' ' + fClone.card.toString() + ' from ' + fClone.constraints[i].valueSet + ' (' + fClone.constraints[i].bindingStrength.toLowerCase() + ")");
                  }
                }
              }
              else {
                formattedFields.push('Property:          ' + inserted_value.trim() + fClone.card.toString());
              }
            }
          }
        } else {
          let inserted_value = this.formatValue(f, de, true);
          if (f.inheritance == 'overridden') {
            constrainedFields.push(inserted_value.trim());
          }
          else {
            if (f.constraints.length > 0) {
              formattedFields.push('Property:           ' + f.identifier.name);
              let i = 0;
              for (i = 0; i < f.constraints.length; i++) {
                if (f.constraints[i].valueSet !== undefined) {
                  formattedFields.push(f.identifier.name + " from " + f.constraints[i].valueSet + " (" + f.constraints[i].bindingStrength.toLowerCase() + ")");
                }
              }
            }
            else {
              formattedFields.push('Property:          ' + inserted_value.trim());
            }
          }
        }
      }
    }
    let allFields = formattedFields.concat(constrainedFields);
    return allFields;
  }

  replaceValue(val) {

    if(val.includes('code'))
    {
      val = val.replace('code', 'ConceptCode');
    }
    else if(val.includes('Coding'))
    {
      val = val.replace('Coding', 'ConceptCode');
    }
    else if(val.includes('CodeableConcept'))
    {
      val = val.replace('CodeableConcept', 'ConceptCode');
    }
    return val;
  }

  formatValue(value, de, formatAsField, path) {
    let formattedValue = this.formatValueByType(value, de);

    //first do card
    if ('card' in value) {
      if (value.effectiveCard.max == 0) {
        if (!formatAsField) {
          formatAsField = true;
          return `Value ${rightPad('0..0', this.maxRightPad)}`;
        } else {
          return `${formattedValue} ${rightPad('0..0', this.maxRightPad)}`;
        }
      }

      formattedValue = this.formatValueWithCard(formattedValue, value, formatAsField);
    }

    //then do path
    if (path && path !== 'root' && value.inheritance) {
      formattedValue = `${formattedValue}.${path}`;
    }

    // then try the mess that is constraints
    if ('constraints' in value && value.constraints.length > 0) {
      if (!formatAsField && value.constructor.name == 'RefValue' && value.constraints.length == 1 && value.constraints[0].constructor.name == 'TypeConstraint') {
        formatAsField = true;
        formattedValue = `${rightPad('',this.maxRightPad)}Value`;
      }
      formattedValue = this.formatValueWithConstraints(formattedValue, value, de, formatAsField);
      formattedValue = this.replaceValue(formattedValue);
      if (!formatAsField && value.inheritance === 'overridden') {
        if (de.identifier.name === value.constraints[0].lastModifiedBy.name) {
          let formattedValueParts = formattedValue.split(" ");
          let firstPart = `Value only ${formattedValueParts[0]}\n`
          if (formattedValueParts.length > 1) {
            firstPart += `Value ${formattedValueParts.slice(1).join(" ")}`;
          }
          return firstPart.replace(/[0-9]+..[0-9]+/, '');
        }
      }
    }

    formattedValue = this.replaceValue(formattedValue);

    if (!formatAsField) {
      return `${rightPad('Value:',this.maxPlacement - 6)}${formattedValue}`.replace(/[0-9]+..[0-9]+/, '');
    }

    return formattedValue;

  }

  formatValueByType(value, de) {
    if (value.identifier && value.identifier.fqn) {
      this.getIdFromFqnAndTrackUsed(value.identifier.fqn);
    }

    switch (value.constructor.name) {
    case 'IdentifiableValue':
      return value.identifier.name;
    case 'RefValue':
      return value.identifier.name;
    case 'ChoiceValue': {
      let choiceStrings = [];
      for (const opt of value.options) {
        var choiceStr = this.formatValueByType(opt, de, true);
        // formatValueWithConstraints(formattedByPath, value, de, formatAsField);
        choiceStr = this.formatValueWithConstraints(choiceStr, opt, de, false);

        // choiceStr = this.formatValueWithConstraints(choiceStr, opt, de, true)
        choiceStrings.push(choiceStr);
      }
      return choiceStrings.join(' or ');
        // return 'learn how to format choices'
    }
    case 'TBD':
      return `TBD "${value.text}"`;
    default:
      return;
    }
  }

  formatValueWithPath(formattedValue, paths) {
    let pathsClone = [...paths];

    while (pathsClone.length > 0) {
      const p = pathsClone.shift();
      if (p.name == 'Units' && pathsClone.length > 1 && pathsClone[1].name == 'Coding') {
        pathsClone.shift();
        continue;
      }

      if (['code', 'Coding', 'CodeableConcept'].includes(p.name)) {
        continue;
      }

      formattedValue = `${formattedValue}.${p.name}`;
    }

    formattedValue = this.replaceValue(formattedValue);

    return formattedValue;
  }

  formatValueWithCard(formattedValue, value, formatAsField) {

    formattedValue = this.replaceValue(formattedValue)

    if (!formatAsField && value.effectiveCard.min == 1 && value.effectiveCard.max == 1) {
      return formattedValue;
    }

    if (formatAsField && value.inheritedFrom) { //handled in formatbyConstrainttype
      return `${ rightPad('', this.maxRightPad) }${formattedValue}`;
    }

    if (value.constructor.name == 'ChoiceValue') {
      formattedValue = `(${formattedValue})`;
    }
    let cardString = `${value.effectiveCard.toString()} `;

    if (formatAsField) cardString = rightPad(cardString, this.maxRightPad);
    cardString = cardString.replace(':', '');

    return `${formattedValue} ${cardString}`;
  }

  formatValueWithConstraints(formattedByPath, value, de, formatAsField) {
    let counter = 0;
    let formattedWithConstraintTerms = [];
    let formattedWithConstraint = '';
    for (const con of value.constraints) {
      if (con.lastModifiedBy.fqn == de.identifier.fqn) {
        counter += 1;
        if (con.constructor.name === 'IncludesTypeConstraint') {
          formattedWithConstraint = this.formatValueByConstraintType('', con, formatAsField, value);
        }
        else {
          formattedWithConstraint = this.formatValueByConstraintType(formattedByPath, con, formatAsField, value);
        }
        formattedWithConstraintTerms.push(this.replaceValue(formattedWithConstraint));
      }
    }
    if (formattedWithConstraintTerms.length > 0) {
      return formattedWithConstraintTerms.join('\n');
    }
    else {
      return formattedByPath;
    }
  }

  formatValueByConstraintType(formattedValue, constraint, formatAsField, value) {
    formattedValue = this.replaceValue(formattedValue);
    switch (constraint.constructor.name) {
    case 'TypeConstraint': {
      if (formatAsField && !value.inheritance && !constraint.onValue) {
        constraint.onValue = true;
      }
      return this.formatValueWithTypeConstraint(formattedValue, constraint);
    }
    case 'ValueSetConstraint': {
      if (!formatAsField && constraint.path.length >= 2 && constraint.path[0].name == 'Units' && constraint.path[1].name == 'Coding') {
        return [
          formattedValue,
          `${rightPad('', this.maxRightPad)}${this.formatValueWithValueSetConstraint(`${formattedValue.replace(/.*\s([^\s]*)/,'$1')}.Units`, constraint)}`,
        ].join('\r\n');
      }

      return this.formatValueWithValueSetConstraint(formattedValue, constraint);
    }
    case 'CardConstraint': {
      if (formatAsField) {
        return this.formatValueWithCardConstraint(formattedValue, constraint);
      } else {
        return formattedValue;
      }
    }
    case 'IncludesTypeConstraint':
      return this.formatValueWithIncludesTypeConstraint(formattedValue, constraint);
    case 'IncludesCodeConstraint':
      return this.formatValueWithIncludesCodeConstraint(formattedValue, constraint);
    case 'BooleanConstraint':
      return this.formatValueWithBooleanConstraint(formattedValue, constraint);
    case 'CodeConstraint':
      return this.formatValueWithCodeConstraint(formattedValue, constraint);
    default:
      console.log('learn to deal with this %s', constraint.constructor.name);
      return formattedValue;
    }
  }

  formatValueWithTypeConstraint(formattedValue, constraint) {
    if (constraint.isA.fqn) {
      this.getIdFromFqnAndTrackUsed(constraint.isA.fqn);
    }
    if (constraint.onValue) {
      return `${formattedValue.trim()} only ${constraint.isA.name}`;
    } else {
      if (formattedValue === '') {
        console.log("issue over here");
      }
      return `${formattedValue.trim()} substitute ${constraint.isA.name}`;
    }
  }

  formatValueWithValueSetConstraint(formattedValue, constraint) {
    let vs = constraint.valueSet;

    if (vs.identifier && vs.identifier.fqn) {
      this.getIdFromFqnAndTrackUsed(vs.identifier.fqn);
    }


    if (vs.startsWith('http://standardhealthrecord.org')) {
      vs = this.getVSFromURIAndTrackUsed(vs);
    } else if (vs.startsWith('urn:tbd:')) {
      vs = `TBD "${vs.replace('urn:tbd:', '')}"`;
    }

    formattedValue = this.replaceValue(formattedValue);

    let vs_object = this.specs._valueSets.findByURL(vs);
    if (vs_object !== undefined) {
      vs = vs_object.identifier.name;
    }

    switch (constraint.bindingStrength) {
    case 'REQUIRED':
      return `${formattedValue} from ${vs}`;
    case 'EXTENSIBLE':
      return `${formattedValue} from ${vs} (extensible)`;
    case 'PREFERRED':
      return `${formattedValue} from ${vs} (preferred)`;
    case 'EXAMPLE':
      return `${formattedValue} from ${vs} (example)`;
    default:
      return formattedValue;
    }
  }

  formatValueWithCardConstraint(formattedValue, constraint, formatAsField) {
    let formattedConstraint = `${formattedValue.replace('\t','')} ${constraint.card.toString()}`;
    return formattedConstraint;
    // return value;
  }

  formatValueWithBooleanConstraint(formattedValue, constraint) {
    return `${formattedValue} = ${constraint.value}`;
  }

  formatValueWithCodeConstraint(formattedValue, constraint) {
    let shorthand = this.shFromCodeSystem(constraint.code.system);
    if (!shorthand) {
      shorthand = '';
    }

    var formattedDisplay = '';
    if (constraint.code.display) {
      formattedDisplay = ` "${constraint.code.display}"`;
    }

    var formattedCode = `${shorthand}#${constraint.code.code}${formattedDisplay}`;

    if (constraint.path.length >= 2 && constraint.path[0].name == 'Units' && constraint.path[1].name == 'Coding') {
      return `${formattedValue} with units ${formattedCode}`;
    }
    if (formattedValue.includes('.ConceptCode')) {
      formattedValue = formattedValue.replace('.ConceptCode','');
    }
    return `${formattedValue} = ${formattedCode}`;
  }

  formatValueWithIncludesTypeConstraint(formattedValue, constraint) {
    let formattedConstraint = `${rightPad('',this.maxRightPad)} includes ${constraint.isA.name} ${constraint.card.toString()}`;
    if (formattedValue) {
      return [formattedValue, formattedConstraint].join('\r\n');
    }
    else {
      return formattedConstraint;
    }
  }

  formatValueWithIncludesCodeConstraint(formattedValue, constraint) {
    let shorthand = this.shFromCodeSystem(constraint.code.system);
    if (!shorthand) {
      shorthand = '';
    }

    var formattedDisplay = '';
    if (constraint.code.display) {
      formattedDisplay = ` "${constraint.code.display}"`;
    }

    var formattedCode = `${shorthand}#${constraint.code.code}${formattedDisplay.trim()}`;

    let formattedConstraint = `${rightPad('\t',this.maxRightPad)} += ${formattedCode.trim()}`;
    return [formattedValue, formattedConstraint].join('\r\n');
  }
}

module.exports = { DataElementFormatterCimpl6 };
