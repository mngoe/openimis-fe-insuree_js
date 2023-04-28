import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  Dialog,
  DialogTitle,
  Divider,
  Button,
  DialogActions,
  DialogContent,
} from "@material-ui/core";
import {
  FormattedMessage,
  withModulesManager,
} from "@openimis/fe-core";
const styles = (theme) => ({
  dialogTitle: theme.dialog.title,
  dialogContent: theme.dialog.content,
});

class AttachmentDialog extends Component {
  state = {
    open: false,
    attachment: null,
    attachmentId: null,
  };

  componentDidUpdate(prevProps, props, snapshot) {
    const { readOnly = false } = this.props;
    if (!_.isEqual(prevProps.attachment, this.props.attachment) && !!this.props.attachment && !!this.props.attachment.idAttachment) {
      this.setState(
        (state, props) => ({
          open: true,
          attachmentId: props.attachment.idAttachment,
          attachment: {},
        }),
      );
    } else if (!_.isEqual(prevProps.attachment, this.props.attachment) && !!this.props.attachment && !this.props.attachment.idAttachment) {
      let attachment = this.props.attachment;
      this.setState({ open: true, attachmentId: null, attachment });
    }
  }

  getUrl = (attachment) => {
    if (attachment?.document) {
      return `data:image/png;base64,${attachment.document}`;
    }
    return null;
  };

  onClose = () => this.setState({ open: false }, (e) => !!this.props.close && this.props.close());


  render() {
    const { classes, attachment } = this.props;
    const { open } = this.state;
    if (!attachment) return null;
    return (
      <Dialog open={open} fullWidth={true}>
        <DialogTitle className={classes.dialogTitle}>
          <FormattedMessage module="insuree" id="attachments.title" values={{ "filename": attachment.filename }} />
        </DialogTitle>
        <Divider />
        <DialogContent className={classes.dialogContent}>
          <div>
            <img src={this.getUrl(attachment)} height={500} width={500} />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.onClose} color="primary">
            <FormattedMessage module="insuree" id="close" />
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withModulesManager(
  (injectIntl(withTheme(withStyles(styles)(AttachmentDialog)))),
);
