import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { formatMessage, AutoSuggestion, withModulesManager, ProgressOrError } from "@openimis/fe-core";
import { fetchQuestions } from "../actions";
import _debounce from "lodash/debounce";
import _ from "lodash";

class InsureeQuestionsPicker extends Component {
  componentDidMount() {
    this.props.fetchQuestions();
  }

  render() {
    const { classes, fetchingInsureeQuestions, errorInsureeQuestions, InsureeQuestions } = this.props;
    console.log(this.props);
    return (
      <div>
        <ProgressOrError progress={fetchingInsureeQuestions} error={errorInsureeQuestions} />
        <table>
          {!!InsureeQuestions && InsureeQuestions.map(e => {
            <tr><td>{e.question}</td></tr>
          })}
        </table>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  InsureeQuestions: state.insuree.InsureeQuestions,
  fetchingInsureeQuestions: state.insuree.fetchingInsureeQuestions,
  fetchedInsureeQuestions: state.insuree.fetchedInsureeQuestions,
  errorInsureeQuestions: state.insuree.errorInsureeQuestions,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchQuestions }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(withModulesManager(InsureeQuestionsPicker)));
