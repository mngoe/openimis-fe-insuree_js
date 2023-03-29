import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import _ from "lodash";
import InsureeAttachmentPanel from "./InsureeAttachmentPanel";

class HeadInsureeAttachmentPanel extends Component {
  onEditedChanged = (head) => {
    let edited = { ...this.props.edited };
    edited["headInsuree"] = head;
    this.props.onEditedChanged(edited);
  };

  render() {
    const { intl, edited } = this.props;
    return (
      <Fragment>
        <InsureeAttachmentPanel
          {...this.props}
          edited={!!edited ? edited.headInsuree : null}
          onEditedChanged={this.onEditedChanged}
          title="insuree.HeadInsureeAttachmentPanel.title"
        />
      </Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      downloadAttachment,
    },
    dispatch,
  );
};

export default injectIntl(HeadInsureeAttachmentPanel);
