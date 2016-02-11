/* global describe, it, beforeEach, afterEach */

import React, {Component, PropTypes} from 'react';
import {render, unmountComponentAtNode} from 'react-dom';
import {findRenderedDOMComponentWithTag, Simulate} from 'react-addons-test-utils';

import expect from 'expect';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('local', () => {
  it('stubby stub', () => {});
});
