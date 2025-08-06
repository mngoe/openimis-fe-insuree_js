import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import DeleteIcon from "@material-ui/icons/Delete";
import FileIcon from "@material-ui/icons/Add";
import {
  formatMessage,
  withModulesManager,
  Table,
  TextInput,
  PublishedComponent
} from "@openimis/fe-core";
import { Paper, Box, Link, IconButton } from "@material-ui/core";
import _ from "lodash";

const styles = (theme) => ({
  paper: theme.paper.paper,
});

class FamilyAttachmentPanel extends Component {
  state = {
    familyAttachments: [],
    attachment: null,
  };

  initData = () => {
    let familyAttachments = [];
    if (!!this.props.edited[`attachments`]) {
      familyAttachments = this.props.edited[`attachments`] || [];
    }
    if (!this.props.forReview && !_.isEqual(familyAttachments[familyAttachments.length - 1], {})) {
      familyAttachments.push({});
    }
    return familyAttachments;
  };

  componentDidMount() {
    this.setState({ familyAttachments: this.initData() });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.edited_id && !this.props.edited_id) {
      let familyAttachments = [];
      if (!this.props.forReview) {
        familyAttachments.push({});
      }
      this.setState({ familyAttachments, reset: this.state.reset + 1 });
    } else if (
      prevProps.reset !== this.props.reset ||
      (!!this.props.edited && !!this.props.edited[`attachments`] &&
        !_.isEqual(prevProps.edited[`attachments`], this.props.edited[`attachments`]))
    ) {
      this.setState({
        familyAttachments: this.initData(),
      });
    }
  }

  _updateData = (idx, updates) => {
    const familyAttachments = [...this.state.familyAttachments];
    updates.forEach((update) => (familyAttachments[idx][update.attr] = update.v));
    if (!this.props.forReview && familyAttachments.length === idx + 1) {
      familyAttachments.push({});
    }
    return familyAttachments;
  };

  

  _onEditedChanged = (familyAttachments) => {
    let edited = { ...this.props.edited };
    edited[`attachments`] = familyAttachments;
    this.props.onEditedChanged(edited);
  };

  _onChange = (idx, attr, v) => {
    let familyAttachments = this._updateData(idx, [{ attr, v }]);
    this._onEditedChanged(familyAttachments);
  };

  _onDelete = (idx) => {
    const familyAttachments = [...this.state.familyAttachments];
    familyAttachments[idx].title = '';
    familyAttachments.splice(idx, 1);
    this._onEditedChanged(familyAttachments);
  };

  addAttachment = (document, idx) => {
    this._onChange(idx, 'document', document);
  };

  fileSelected = (f, idx) => {
    if (!!f.target.files) {
      const file = f.target.files[0];
      let familyAttachments = [...this.state.familyAttachments];
      familyAttachments[idx].filename = file.name;
      familyAttachments[idx].mime = file.type;
      this.setState({ familyAttachments }, (e) => {
        var reader = new FileReader();
        reader.onloadend = (loaded) => {
          this.addAttachment(btoa(loaded.target.result), idx);
        };
        reader.readAsBinaryString(file);
      });
    }
  };

  formatFileName(i, idx) {
    if (!!i.idAttachment)
      return (
        <Link onClick={(e) => this.setState({ attachment: i })}>
          {i.filename || ""}
        </Link>
      );
    if (!!i.filename) return <i>{i.filename}</i>;
    return (
      <IconButton variant="contained" component="label">
        <FileIcon />
        <input type="file" style={{ display: "none" }} onChange={(f) => this.fileSelected(f, idx)} accept="image/*" />
      </IconButton>
    );
  }
  rowLocked = (i) => !!i.clientMutationId || this.props.readOnly;
  rowDisabled = (i) => !!i.clientMutationId || this.props.readOnly;
  render() {
    const { intl, classes, edited, forReview, readOnly = false } = this.props;
    if (!edited) return null;

    let headers = [
      "insureeAttachment.title",
      "insureeAttachment.fileName"
    ];

    let itemFormatters = [
      (i, idx) => (
        <TextInput
          readOnly={!!forReview || readOnly}
          value={i.title}
          onChange={(v) => this._onChange(idx, "title", v)}
        />
      ),
      (i, idx) => this.formatFileName(i, idx),
    ];

    if (!readOnly) {
      headers.push("insureeAttachment.action");
      itemFormatters.push((i, idx) => {
        if (idx < this.state.familyAttachments.length - 1) {
          return (
            <IconButton onClick={(e) => this._onDelete(idx)}>
              <DeleteIcon />
            </IconButton>
          );
        }
        return null;
      });
    }

    return (
      <Paper className={classes.paper}>
        <Fragment>
          <PublishedComponent
            pubRef="insuree.AttachmentDialog"
            attachment={this.state.attachment}
            close={(e) => this.setState({ attachment: null })}
          />
          <Table
            module="insuree"
            header={formatMessage(intl, "insuree", `edit.attachments.title`)}
            headers={headers}
            itemFormatters={itemFormatters}
            items={this.state.familyAttachments}
            rowLocked={this.rowLocked}
            rowDisabled={this.rowDisabled}
          />
        </Fragment>
      </Paper>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(FamilyAttachmentPanel))));