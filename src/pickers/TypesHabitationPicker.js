import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { withModulesManager, SelectInput } from "@openimis/fe-core";
import { fetchTypesHabitation } from "../actions";
import _debounce from "lodash/debounce";
import _ from "lodash";

class TypesHabitationPicker extends Component {
  componentDidMount() {
    if (!this.props.fetched && !this.props.fetching) {
      // prevent loading multiple times the cache
      this.props.fetchTypesHabitation(this.props.modulesManager);
    }
  }

  nullDisplay = this.props.nullLabel || formatMessage(this.props.intl, "insuree", `TypesHabitation.null`);

  formatSuggestion = (i) =>
    !!i ? `${formatMessage(this.props.intl, "insuree", `TypesHabitation.${i}`)}` : this.nullDisplay;

  onSuggestionSelected = (v) => {
    this.props.onChange(v, this.formatSuggestion(v));
  };

  render() {
    const {
      intl,
      typesHabitationOptions,
      module = "insuree",
      withLabel = true,
      label = "TypesHabitationPicker.label",
      withPlaceholder = false,
      placeholder,
      value,
      reset,
      readOnly = false,
      required = false,
      withNull = false,
    } = this.props;
    let options = !!typesHabitationOptions ? typesHabitationOptions.map((v) => ({ value: v, label: this.formatSuggestion(v) })) : [];
    if (withNull) {
      options.unshift({ value: null, label: this.formatSuggestion(null) });
    }
    return (
      <SelectInput
        module={module}
        options={options}
        label={!!withLabel ? label : null}
        placeholder={withPlaceholder ? placeholder || formatMessage(intl, "insuree", "TypesHabitationPicker.placeholder") : null}
        onChange={this.onSuggestionSelected}
        value={value}
        reset={reset}
        readOnly={readOnly}
        required={required}
        withNull={withNull}
        nullLabel={this.nullDisplay}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  typesHabitationOptions: state.insuree.typesHabitationOptions,
  fetching: state.insuree.fetchingTypesHabitationOptions,
  fetched: state.insuree.fetchedTypesHabitationOptions,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchTypesHabitation }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(withModulesManager(TypesHabitationPicker)));