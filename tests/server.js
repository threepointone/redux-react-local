/* global describe, it, beforeEach, afterEach */

import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { render, unmountComponentAtNode } from 'react-dom'

import { createStore, combineReducers } from 'redux'
import { connect, Provider } from 'react-redux'

import { local, reducer } from '../src'
import { stringifySafe } from '../src/server'

import expect from 'expect'
import expectJSX from 'expect-jsx'
expect.extend(expectJSX)

class LocalRoot extends Component {
  store = createStore(
    combineReducers({ local: reducer })
  )
  render() {
    return (<Provider store={this.store}>
      {this.props.children}
    </Provider>)
  }
}

describe('redux-react-local server side', () => {
  it('can prep the redux store with local reducers')
  it('can prepare redux state to be stringified')
})
