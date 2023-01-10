import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import { injectIntl } from "react-intl";
import { formatMessage, SelectInput, withModulesManager, NumberInput } from "@openimis/fe-core";
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
    }
    return data;
  };

  componentDidMount() {
    setTimeout(() => {
      this.setState({ data: this.initData() });
    }, Math.floor(Math.random() * 300));
  }

  _updateData = (idx, updates) => {
    const data = [...this.state.data];
    updates.forEach((update) => (data[idx][update.attr] = update.v));
    return data;
  };

  _onEditedChanged = (data) => {
    let edited = { ...this.props.edited };
    edited[`insureeAnswers`] = [];
    data.forEach((d) => {
      if (d.options != null) {
        edited[`insureeAnswers`].push({
          questionId: d.questionId,
          optionId: d.optionId,
          optionMark: d.optionMark
        })
      } else if (d.answer != null) {
        edited[`insureeAnswers`].push({
          questionId: d.questionId,
          answer: d.answer,
          mark: d.answer
        })
      } else if (d.value != null) {
        edited[`insureeAnswers`].push({
          questionId: d.questionId,
          value: d.value,
          mark: d.mark
        })
      }
    })
    console.log(edited)
    this.props.onEditedChanged(edited);
  };

  _onChange = (idx, attr, v) => {
    let data = this._updateData(idx, [{ attr, v }]);
    this._onEditedChanged(data);
  };

  _onChangeItem = (idx, attr, v) => {
    let data = this._updateData(idx, [{ attr, v }]);
    if (data[idx].options) {
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
    } else {
      if (data[idx].value != null) {
        if (data[idx].value == false) {
          data[idx].mark = 1;
        } else {
          data[idx].mark = 5;
        }
      }
      if (data[idx].answer != '' && data[idx].answer != null) {
        data[idx].answer = v;
        data[idx].mark = v;
      }
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
      insureeQuestions,
      position
    } = this.props;

    //console.log(insureeAnswers)


    if (insureeQuestions[position].questionType == "DROPDOWN") {
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
    } else if (insureeQuestions[position].questionType == "CHECKBOX") {
      return (
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              checked={!!this.state.data[position] && !!this.state.data[position].value}
              disabled={readOnly}
              onChange={(v) => this._onChangeItem(position, "value", !this.state.data[position] || !this.state.data[position].value)}
            />
          }
          label={!!withLabel ? label : null}
        />
      )
    } else if (insureeQuestions[position].questionType == "TEXT") {
      return (
        <NumberInput
          label={label}
          readOnly={readOnly}
          value={this.state.data[position]?.answer}
          onChange={(v) => this._onChange(position, "answer", v)}
        />
      )
    }

  }
}

export default injectIntl(withModulesManager(InsureeOptionsPicker));