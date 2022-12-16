import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { formatMessage, SelectInput, withModulesManager } from "@openimis/fe-core";
import { fetchOptions } from "../actions";
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
    this.props.fetchOptions(this.props.modulesManager);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.reset !== this.props.reset || prevProps.value !== this.props.value) {
      this.setState((state, props) => ({ value: props.value }));
    }
  }

  _onChange = (v) => {
    this.setState({ value: v }, (e) => {
      this.props.onChange(v, v);
    });
  };

  onSuggestionSelected = (v) => this.props.onChange(v, v);

  nullDisplay = this.props.nullLabel || formatMessage(this.props.intl, "insuree", `InsureeGender.null`);

  render() {
    const {
      intl,
      label,
      module = "insuree",
      classes,
      questionID,
      insureeOptions,
      value,
      reset,
      readOnly = false,
      required = false,
      withNull = true,
      withLabel = true,
    } = this.props;
    let opt = [];
    insureeOptions.forEach(function (item) {
      if (questionID == item.questionId.id) {
        opt.push(item.option);
      }
    });

    let options = !!opt ? opt.map((v) => ({ value: v, label: v })) : [];
    //console.log(this.props);
    console.log(value);

    return (
      <SelectInput
        module={module}
        options={options}
        label={!!withLabel ? label : null}
        onChange={this.onSuggestionSelected}
        value={value}
        reset={reset}
        readOnly={readOnly}
        required={required}
        nullLabel={this.nullDisplay}
      />
    );
  }
}

const mapStateToProps = state => ({
  insureeOptions: state.insuree.insureeOptions,
  fetchingInsureeOptions: state.insuree.fetchingInsureeOptions,
  fetchedInsureeOptions: state.insuree.fetchedInsureeOptions,
  errorInsureeOptions: state.insuree.errorInsureeOptions,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchOptions }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(withModulesManager(InsureeOptionsPicker)));
