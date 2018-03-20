const bunyan = require('bunyan');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const { Specifications, Version, Namespace, DataElement, ValueSet, Concept, Cardinality, Identifier, IdentifiableValue, RefValue, PrimitiveIdentifier, ChoiceValue, IncompleteValue, ValueSetConstraint, CodeConstraint, IncludesCodeConstraint, BooleanConstraint, TypeConstraint, IncludesTypeConstraint, CardConstraint, ValueSetIncludesCodeRule, ValueSetIncludesDescendentsRule, ValueSetExcludesDescendentsRule, ValueSetIncludesFromCodeSystemRule, ValueSetIncludesFromCodeRule, ElementMapping, FieldMappingRule, CardinalityMappingRule, FixedValueMappingRule, TBD, PRIMITIVES, REQUIRED, EXTENSIBLE, PREFERRED, EXAMPLE } = require('shr-models');

const VERSION = new Version(5, 2, 3);
const GRAMMAR_VERSION = new Version(5, 0, 1);

var rootLogger = bunyan.createLogger({ name: 'shr-text-import' });

var logger = rootLogger;

function setLogger(bunyanLogger) {
  rootLogger = logger = bunyanLogger;
}

function rightPad(text, max = 6) {
  const numTabs = Math.max(1, max - Math.floor(text.length / 4));
  return `${text}${'\t'.repeat(numTabs)}`;
}

function idFromFQN(fqn) {
  const parts = fqn.split('.');
  if (parts.length == 1) {
    if (fqn.match(/^TBD\(.*\)$/)) {
      return new TBD(fqn.replace(/^TBD\((.*)\)$/, '$1'));
    }
    return new PrimitiveIdentifier(fqn);
  }

  const name = parts.pop();
  let namespace = parts.join('.');

  return new Identifier(namespace, name);
}

Array.prototype.pushNew = function (obj) {
  if (!this.find(o => o == obj)) {
    this.push(obj);
  }
};

function constructCode(code, system, display) {
  const codeObj = new Concept(system, code, display);
  return codeObj;
}

function shorthandFromCodesystem(cs) {
  if (!cs) {
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
    'urn:tbd:': 'TBD',
    'urn:tbd': 'TBD'
  };

  if (shorthands[cs]) {
    return shorthands[cs];
  } else if (cs.match(/http:\/\/standardhealthrecord.org\/shr\/[A-Za-z]*\/cs\/(#[A-Za-z]*CS)/)) {
    return '';
  } else {
    return cs;
  }
}

function formattedCodeFromConcept(concept) {
  var formattedConceptCode = `${shorthandFromCodesystem(concept.system)}#${concept.code}`;
  if (concept.display) {
    formattedConceptCode = `${formattedConceptCode} "${concept.display}"`;
  } else if (concept.description) {
    formattedConceptCode = `${formattedConceptCode} "${concept.description}"`;
  }

  return formattedConceptCode;
}


module.exports = { CimcoreImporter, CimplExporter, DataElementFormatter };