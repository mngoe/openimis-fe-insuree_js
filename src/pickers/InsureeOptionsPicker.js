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
  state = {
    data: [],
  };

  initData = () => {
    let data = [];
    if (!!this.props.insureeAnswers) {

      data = this.props.insureeAnswers || [];
      console.log(data);
      let edited = { ...this.props.edited };
      edited[`insureeAnswers`] = data;
    }
    return data;
  };

  componentDidMount() {
    setTimeout(() => {
      this.setState({ data: this.initData() });
    }, Math.floor(Math.random() * 1000));
  }

  _updateData = (idx, updates) => {
    const data = [...this.state.data];
    updates.forEach((update) => (data[idx][update.attr] = update.v));
    return data;
  };

  _onEditedChanged = (data) => {
    let edited = { ...this.props.edited };
    edited[`insureeAnswers`] = data.map((e) => ({
      questionId: e.questionId,
      optionId: e.optionId,
      optionMark: e.optionMark
    }));
    console.log(edited)
    this.props.onEditedChanged(edited);
  };

  _onChange = (idx, attr, v) => {
    let data = this._updateData(idx, [{ attr, v }]);
    this._onEditedChanged(data);
  };

  _onChangeItem = (idx, attr, v) => {
    let data = this._updateData(idx, [{ attr, v }]);
    if (!v) {
      data[idx].optionLabel = null;
    } else {
      data[idx].options.forEach((e) => {
        if (e.value === v) {
          data[idx].optionId = e.id;
          data[idx].optionMark = e.mark;
        }
      })
      //data[idx].optionLabel = v;
    }
    console.log(data);
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
      updateAttribute,
      onEditedChanged,
      readOnly = false,
      required = false,
      withNull = true,
      withLabel = true,
      insureeAnswers,
      position
    } = this.props;

    //console.log(insureeAnswers)


    return (
      <SelectInput
        module={module}
        options={insureeAnswers[position].options}
        label={!!withLabel ? label : null}
        value={this.state.data[position]?.optionLabel}
        reset={reset}
        readOnly={readOnly}
        required={required}
        withNull={withNull}
        onChange={(v) => this._onChangeItem(position, "optionLabel", v)}
      />
    );
  }
}

export default injectIntl(withModulesManager(InsureeOptionsPicker));