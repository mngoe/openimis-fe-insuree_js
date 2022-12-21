import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { formatMessage, SelectInput, withModulesManager } from "@openimis/fe-core";
import _debounce from "lodash/debounce";
import _ from "lodash";

const INIT_STATE = {
  value: null,
};

class InsureeOptionsPicker extends Component {
  state = INIT_STATE;

  componentDidMount() {
    if (!!this.props.value) {
      this.setState((state, props) => ({ value: props.value }));
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.reset !== this.props.reset || prevProps.value !== this.props.value) {
      this.setState((state, props) => ({ value: props.value }));
    }
  }

  onSuggestionSelected = (v) => this.props.onChange(v, v);

  _updateData = (idx, updates) => {
    const data = [...this.props.insureeAnswers];
    console.log(data);
    updates.forEach((update) => (data[idx][update.attr] = update.v));
    return data;
  };

  _onEditedChanged = (data) => {
    let edited = { ...this.props.edited };
    edited[`insureeAnswers`] = data;
    //this.props.onEditedChanged(edited);
  };

  _onChange = (idx, attr, v) => {
    let data = this._updateData(idx, [{ attr, v }]);
    this._onEditedChanged(data);
    console.log(v);
  };

  _onChangeItem = (idx, attr, v) => {
    let data = this._updateData(idx, [{ attr, v }]);
    if (!v) {
      data[idx].optionLabel = null;
    } else {
      data[idx].options.forEach((e) => {
        if (e.value === v) {
          data[idx].optionId = e.id;
        }
      })
      data[idx].optionLabel = v;
    }
    this._onEditedChanged(data);
  };

  nullDisplay = this.props.nullLabel || formatMessage(this.props.intl, "insuree", `InsureeGender.null`);

  render() {
    const {
      intl,
      label,
      module = "insuree",
      options,
      reset,
      value,
      edited,
      readOnly = false,
      required = false,
      withNull = true,
      withLabel = true,
      insureeAnswers,
      position
    } = this.props;

    console.log(value); 

    return (
      <SelectInput
        module={module}
        options={insureeAnswers[position].options}
        label={!!withLabel ? label : null}
        onChange={this.onSuggestionSelected}
        value={value}
        reset={reset}
        readOnly={readOnly}
        required={required}
        nullLabel={this.nullDisplay}
        withNull={withNull}
      />
    );
  }
}

export default injectIntl(withModulesManager(InsureeOptionsPicker));