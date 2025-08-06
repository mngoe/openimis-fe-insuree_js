import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";
import _ from "lodash";
import {
  Dialog,
  DialogTitle,
  Divider,
  Button,
  DialogActions,
  DialogContent,
  CircularProgress,
} from "@material-ui/core";
import {
  FormattedMessage,
  withModulesManager,
} from "@openimis/fe-core";

const styles = (theme) => ({
  dialogTitle: theme.dialog.title,
  dialogContent: {
    ...theme.dialog.content,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(2),
  },
  imageContainer: {
    maxWidth: "100%",
    maxHeight: "70vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  responsiveImage: {
    maxWidth: "100%",
    maxHeight: "70vh",
    objectFit: "contain",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "300px",
    width: "100%",
  },
  errorMessage: {
    color: theme.palette.error.main,
    textAlign: "center",
    padding: theme.spacing(2),
  },
});

class AttachmentDialog extends Component {
  state = {
    open: false,
    attachment: null,
    attachmentId: null,
    loading: false,
    error: false,
  };

  componentDidUpdate(prevProps, props, snapshot) {
    const { readOnly = false } = this.props;
    if (!_.isEqual(prevProps.attachment, this.props.attachment) && !!this.props.attachment && !!this.props.attachment.idAttachment) {
      this.setState(
        (state, props) => ({
          open: true,
          attachmentId: props.attachment.idAttachment,
          attachment: {},
          loading: true,
          error: false,
        }),
      );
    } else if (!_.isEqual(prevProps.attachment, this.props.attachment) && !!this.props.attachment && !this.props.attachment.idAttachment) {
      let attachment = this.props.attachment;
      this.setState({ open: true, attachmentId: null, attachment, loading: false, error: false });
    }
  }

  getUrl = (attachment) => {
    if (attachment?.document) {
      return `data:image/png;base64,${attachment.document}`;
    }
    return null;
  };

  onClose = () => this.setState({ open: false }, (e) => !!this.props.close && this.props.close());

  handleImageLoad = () => {
    this.setState({ loading: false });
  };

  handleImageError = () => {
    this.setState({ loading: false, error: true });
  };

  render() {
    const { classes, attachment } = this.props;
    const { open, loading, error } = this.state;
    
    if (!attachment) return null;
    
    const imageUrl = this.getUrl(attachment);
    
    return (
      <Dialog 
        open={open} 
        fullWidth={true} 
        maxWidth="md"
        onClose={this.onClose}
      >
        <DialogTitle className={classes.dialogTitle}>
          <FormattedMessage module="insuree" id="attachments.title" values={{ "filename": attachment.filename }} />
        </DialogTitle>
        <Divider />
        <DialogContent className={classes.dialogContent}>
          {loading && (
            <div className={classes.loadingContainer}>
              <CircularProgress />
            </div>
          )}
          
          {error && (
            <div className={classes.errorMessage}>
              <FormattedMessage module="insuree" id="attachments.errorLoading" defaultMessage="Erreur lors du chargement de l'image" />
            </div>
          )}
          
          {imageUrl && (
            <div className={classes.imageContainer}>
              <img 
                src={imageUrl} 
                className={classes.responsiveImage}
                onLoad={this.handleImageLoad}
                onError={this.handleImageError}
                alt={attachment.filename || "Attachment"}
                style={{ display: loading || error ? 'none' : 'block' }}
              />
            </div>
          )}
          
          {!imageUrl && !loading && !error && (
            <div className={classes.errorMessage}>
              <FormattedMessage module="insuree" id="attachments.noImage" defaultMessage="Aucune image disponible" />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={this.onClose} color="primary" variant="contained">
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
