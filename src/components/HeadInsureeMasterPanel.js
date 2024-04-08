import React, { Component, Fragment } from "react";
import InsureeMasterPanel from "./InsureeMasterPanel";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { Contributions, PublishedComponent, formatMessage, withModulesManager } from "@openimis/fe-core";
import { PersonAdd as AddExistingIcon } from "@material-ui/icons";
import { fetchInsureeFull } from "../actions";
import SubFamiliesSummary from "./SubFamiliesSummary";

const INSUREE_HEAD_INSUREE_PANELS_CONTRIBUTION_KEY = "insuree.HeadInsuree.panels";

class HeadInsureeMasterPanel extends Component {
  onEditedChanged = (head) => {
    let edited = { ...this.props.edited };
    edited["headInsuree"] = head;
    this.props.onEditedChanged(edited);
    if (head && head.uuid) {
      this.props.dispatch(fetchInsureeFull(this.props.modulesManager, head.uuid));
    }
  };

  render() {
    const { intl, edited, canShowSubfamily } = this.props;
    console.log(" headinsutree master pannel value, ", this.props);
    let actions = [
      {
        button: (
          <div>
            <PublishedComponent //div needed for the tooltip style!!
              pubRef="insuree.InsureePicker"
              IconRender={AddExistingIcon}
              forcedFilter={["head: false"]}
              onChange={this.onEditedChanged}
            />
          </div>
        ),
        tooltip: formatMessage(intl, "insuree", "selectHeadInsuree.tooltip"),
      },
    ];
    return (
      <Fragment>
        <InsureeMasterPanel
          {...this.props}
          edited={!!edited ? edited.headInsuree : null}
          onEditedChanged={this.onEditedChanged}
          title="insuree.HeadInsureeMasterPanel.title"
          actions={actions}
        />
        {canShowSubfamily == true ? (
          <SubFamiliesSummary
            {...this.props}
            edited={!!edited ? edited : null}
            onEditedChanged={this.onEditedChanged}
            title="insuree.Family.families"
          />
        ) : null}

        <Contributions
          {...this.props}
          updateAttribute={this.updateAttribute}
          contributionKey={INSUREE_HEAD_INSUREE_PANELS_CONTRIBUTION_KEY}
        />
      </Fragment>
    );
  }
}

export default withModulesManager(connect()(injectIntl(HeadInsureeMasterPanel)));
