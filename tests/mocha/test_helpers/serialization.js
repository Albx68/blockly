/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.helpers.serialization');

import {runTestCases} from './common.js';

/**
 * Serialization test case.
 * @implements {TestCase}
 * @record
 */
export class SerializationTestCase {
  /**
   * Class for a block serialization test case.
   */
  constructor() {
    /**
     * @type {string} The block xml to use for test. Do not provide if json is
     *     provided.
     */
    this.xml;
    /**
     * @type {string|undefined} The expected xml after round trip. Provided if
     *    it different from xml that was passed in.
     */
    this.expectedXml;
    /**
     * @type {string} The block json to use for test. Do not provide if xml is
     *     provided.
     */
    this.json;
    /**
     * @type {string|undefined} The expected json after round trip. Provided if
     *    it is different from json that was passed in.
     */
    this.expectedJson;
  }
  /**
   * Asserts that the block created from xml has the expected structure.
   * @param {!Blockly.Block} block The block to check.
   */
  assertBlockStructure(block) {}
}

/**
 * Runs serialization test suite.
 * @param {!Array<!SerializationTestCase>} testCases The test cases to run.
 */
export const runSerializationTestSuite = (testCases) => {
  /**
   * Creates test callback for xmlToBlock test.
   * @param {!SerializationTestCase} testCase The test case information.
   * @return {!Function} The test callback.
   */
  const createSerializedDataToBlockTestCallback = (testCase) => {
    return function () {
      let block;
      if (testCase.json) {
        block = Blockly.serialization.blocks.append(
          testCase.json,
          this.workspace,
          {recordUndo: true},
        );
      } else {
        block = Blockly.Xml.domToBlock(
          Blockly.utils.xml.textToDom(testCase.xml),
          this.workspace,
        );
      }
      this.clock.runAll();
      testCase.assertBlockStructure(block);
    };
  };
  /**
   * Creates test callback for xml round trip test.
   * @param {!SerializationTestCase} testCase The test case information.
   * @return {!Function} The test callback.
   */
  const createRoundTripTestCallback = (testCase) => {
    return function () {
      if (testCase.json) {
        const block = Blockly.serialization.blocks.append(
          testCase.json,
          this.workspace,
          {recordUndo: true},
        );
        this.clock.runAll();
        const generatedJson = Blockly.serialization.blocks.save(block);
        const expectedJson = testCase.expectedJson || testCase.json;
        chai.assert.deepEqual(generatedJson, expectedJson);
      } else {
        const block = Blockly.Xml.domToBlock(
          Blockly.utils.xml.textToDom(testCase.xml),
          this.workspace,
        );
        this.clock.runAll();
        const generatedXml = Blockly.Xml.domToPrettyText(
          Blockly.Xml.blockToDom(block),
        );
        const expectedXml = testCase.expectedXml || testCase.xml;
        chai.assert.equal(generatedXml, expectedXml);
      }
    };
  };
  suite('Serialization', function () {
    suite('xmlToBlock', function () {
      runTestCases(testCases, createSerializedDataToBlockTestCallback);
    });
    suite('xml round-trip', function () {
      setup(function () {
        // The genUid is undergoing change as part of the 2021Q3
        // goog.module migration:
        //
        // - It is being moved from Blockly.utils to
        //   Blockly.utils.idGenerator (which itself is being renamed
        //   from IdGenerator).
        // - For compatibility with changes to the module system (from
        //   goog.provide to goog.module and in future to ES modules),
        //   .genUid is now a wrapper around .TEST_ONLY.genUid, which
        //   can be safely stubbed by sinon or other similar
        //   frameworks in a way that will continue to work.
        if (Blockly.utils.idGenerator && Blockly.utils.idGenerator.TEST_ONLY) {
          sinon
            .stub(Blockly.utils.idGenerator.TEST_ONLY, 'genUid')
            .returns('1');
        } else {
          // Fall back to stubbing original version on Blockly.utils.
          sinon.stub(Blockly.utils, 'genUid').returns('1');
        }
      });

      teardown(function () {
        sinon.restore();
      });

      runTestCases(testCases, createRoundTripTestCallback);
    });
  });
};
