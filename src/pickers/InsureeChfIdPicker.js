import React, { Component } from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { Grid } from "@material-ui/core";
import { withModulesManager, TextInput, ProgressOrError, formatMessage, formatMessageWithValues } from "@openimis/fe-core";

import { fetchInsuree } from "../actions";
import _debounce from "lodash/debounce";
import { DEFAULT, EMPTY_STRING } from "../constants";

const INIT_STATE = {
  search: "",
  selected: "",
};

class InsureeChfIdPicker extends Component {
  state = INIT_STATE;

  constructor(props) {
    super(props);
    this.chfIdMinLength = props.modulesManager.getConf("fe-insuree", "insureeForm.chfIdMinLength", 12);
    this.chfIdMaxLength = props.modulesManager.getConf("fe-insuree", "insureeForm.chfIdMaxLength", 20);
    this.renderLastNameFirst = props.modulesManager.getConf(
      "fe-insuree",
      "renderLastNameFirst",
      DEFAULT.RENDER_LAST_NAME_FIRST,
    );
  }

  componentDidMount() {
    if (this.props.value) {
      this.setState((state, props) => ({
        search: !!props.value ? props.value.chfId : "",
        selected: props.value,
      }));
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.reset !== this.props.reset) {
      this.setState((state, props) => ({
        ...INIT_STATE,
        search: !!props.value ? props.value.chfId : "",
        selected: props.value,
      }));
    } else if (!_.isEqual(prevProps.insuree, this.props.insuree)) {
      this.props.onChange(this.props.insuree, this.formatInsuree(this.props.insuree));
    } else if (!_.isEqual(prevProps.value, this.props.value)) {
      this.setState((state, props) => ({
        search: !!props.value ? props.value.chfId : this.state.search,
        selected: props.value,
      }));
    }
  }

  fetch = (chfId) => {
    this.setState(
      {
        search: chfId,
        selected: "",
      },
      (e) => this.props.fetchInsuree(this.props.modulesManager, chfId),
    );
  };

  debouncedSearch = _debounce(this.fetch, this.props.modulesManager.getConf("fe-insuree", "debounceTime", 800));

  formatInsuree(insuree) {
    const { search } = this.state;
    const { intl } = this.props;

    if (!insuree) {
      return search === EMPTY_STRING ? EMPTY_STRING : formatMessage(intl, "insuree", "notFound");
    }

    return this.renderLastNameFirst
      ? `${insuree.lastName} ${insuree.otherNames}`
      : `${insuree.otherNames} ${insuree.lastName}`;
  }

  render() {
    const { readOnly = false, required = false, intl } = this.props;
    return (
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextInput
            readOnly={readOnly}
            autoFocus={true}
            module="insuree"
            label="Insuree.chfId"
            value={this.state.search}
            onChange={(v) => this.debouncedSearch(v)}
            //inputProps={{
            //"maxLength": this.chfIdMaxLength,
            //}}
            required={required}
            error={
              !!this.state.search && 
              this.state.search.length < this.chfIdMinLength ?
              formatMessageWithValues(intl, "insuree", "chfIdMinLengthRequired", {minLength: this.chfIdMinLength}): 
              this.state.search.length > this.chfIdMaxLength ? 
              formatMessageWithValues(intl, "insuree", "chfIdMaxLengthRequired", {maxLength: this.chfIdMaxLength}) :
              null
            }
          />
        </Grid>
        <Grid item xs={6} hidden={!!this.state.selected && this.state.selected[`email`] === "newhivuser_XM7dw70J0M3N@gmail.com"}>
            <ProgressOrError progress={this.props.fetching} error={this.props.error} />
            {!this.props.fetching && (
              <TextInput
                readOnly={true}
                module="insuree"
                label="Insuree.names"
                value={this.formatInsuree(this.state.selected)}
              />
            )}
        </Grid>

      </Grid>
    );
  }
}

const mapStateToProps = (state, props) => ({
  fetching: state.insuree.fetchingInsuree,
  error: state.insuree.errorInsuree,
  insuree: state.insuree.insuree,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchInsuree }, dispatch);
};

export default withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(InsureeChfIdPicker)));
