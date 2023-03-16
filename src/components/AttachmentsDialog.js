import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import SaveIcon from "@material-ui/icons/SaveAlt";
import DeleteIcon from "@material-ui/icons/Delete";
import FileIcon from "@material-ui/icons/Add";
import {
    DialogActions,
    DialogContent,
    Dialog,
    DialogTitle,
    Button,
    IconButton,
    Divider
} from "@material-ui/core";
import {
    TextInput,
    FormattedMessage,
    formatMessage,
    formatMessageWithValues,
    PublishedComponent,
    Table,
    withModulesManager,
    coreConfirm,
    ProgressOrError
} from "@openimis/fe-core";
import {
    fetchInsureeAttachments,
    downloadAttachment,
    deleteAttachment,
    createAttachment,
    updateAttachment,
} from "../actions";
import { RIGHT_ADD } from "../constants";

const styles = (theme) => ({
    dialogTitle: theme.dialog.title,
    dialogContent: theme.dialog.content,
});

class AttachmentsDialog extends Component {
    state = {
        open: false,
        insureeId: null,
        insureeAttachments: [],
        attachmentToDelete: null,
        updatedAttachments: new Set(),
        reset: 0,
    }

    componentDidUpdate(prevProps, props, snapshot) {
        const { readOnly = false } = this.props;
        if (!_.isEqual(prevProps.insureeAttachments, this.props.insureeAttachments)) {
            var insureeAttachments = [...(this.props.insureeAttachments || [])];
            if (!this.props.readOnly && this.props.rights.includes(RIGHT_ADD)) {
                insureeAttachments.push({});
            }
            this.setState({ insureeAttachments, updatedAttachments: new Set() });
        } else if (!_.isEqual(prevProps.insuree, this.props.insuree) && !!this.props.insuree && !!this.props.insuree.id) {
            this.setState(
                (state, props) => ({
                    open: true,
                    insureeId: props.insuree.id,
                    insureeAttachments: readOnly ? [] : [{}],
                    updatedAttachments: new Set(),
                }),
                (e) => {
                    if (!!this.props.insuree && !!this.props.insuree.id) {
                        this.props.fetchInsureeAttachments(this.props.insuree);
                    }
                },
            );
        } else if (!_.isEqual(prevProps.insuree, this.props.insuree) && !!this.props.insuree && !this.props.insuree.id) {
            let insureeAttachments = [...(this.props.insuree.attachments || [])];
            if (!readOnly) {
                insureeAttachments.push({});
                this.props.onUpdated();
            }
            this.setState({ open: true, insureeId: null, insureeAttachments, updatedAttachments: new Set() });
        } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
            var insureeAttachments = [...this.state.insureeAttachments];
            if (!!this.state.attachmentToDelete) {
                insureeAttachments = insureeAttachments.filter((a) => a.id !== this.state.attachmentToDelete.id);
            } else if (!_.isEqual(_.last(insureeAttachments), {})) {
                insureeAttachments.push({});
            }
            this.setState((state) => ({
                insureeAttachments,
                updatedAttachments: new Set(),
                attachmentToDelete: null,
                reset: state.reset + 1,
            }));
            // called from ClaimForm!
            // this.props.journalize(this.props.mutation);
        } else if (
            prevProps.confirmed !== this.props.confirmed &&
            !!this.props.confirmed &&
            !!this.state.attachmentToDelete
        ) {
            this.props.deleteAttachment(
                this.state.attachmentToDelete,
                formatMessageWithValues(this.props.intl, "insuree", "insuree.InsureeAttachment.delete.mutationLabel", {
                    file: `${this.state.attachmentToDelete.title} (${this.state.attachmentToDelete.filename})`,
                }),
            );
        }
    }

    delete = (a, i) => {
        if (!!a.id) {
            this.setState({ attachmentToDelete: a }, (e) =>
                this.props.coreConfirm(
                    formatMessage(this.props.intl, "insuree", "deleteInsureeAttachment.confirm.title"),
                    formatMessageWithValues(this.props.intl, "insuree", "deleteInsureeAttachment.confirm.message", {
                        file: `${a.title} (${a.filename})`,
                    }),
                ),
            );
        } else {
            var insureeAttachments = [...this.state.insureeAttachments];
            insureeAttachments.splice(i, 1);
            insureeAttachments.pop();
            this.props.insuree.attachments = [...insureeAttachments];
            insureeAttachments.push({});
            this.setState((state) => ({ insureeAttachments, reset: state.reset + 1 }));
        }
    };

    addAttachment = (document) => {
        let attachment = { ..._.last(this.state.insureeAttachments), document };
        if (!!this.state.insureeId) {
            this.props.createAttachment(
                { ...attachment, insureeId: this.state.insureeId },
                formatMessageWithValues(this.props.intl, "insuree", "insuree.InsureeAttachment.create.mutationLabel", {
                    file: `${attachment.title} (${attachment.filename})`
                }),
            );
        } else {
            if (!this.props.insuree.attachments) {
                this.props.insuree.attachments = [];
            }
            this.props.insuree.attachments.push(attachment);
            var insureeAttachments = [...this.state.insureeAttachments];
            insureeAttachments.push({});
            this.setState({ insureeAttachments });
        }
    };

    update = (i) => {
        let attachment = { insureeId: this.state.insureeId, ...this.state.insureeAttachments[i] };
        this.props.updateAttachment(
            attachment,
            formatMessageWithValues(this.props.intl, "insuree", "insuree.InsureeAttachment.update.mutationLabel", {
                file: `${attachment.title} (${attachment.filename})`
            }),
        );
    };

    download = (a) => {
        this.props.downloadAttachment(a);
    };

    onClose = () => this.setState({ open: false }, (e) => !!this.props.close && this.props.close());

    fileSelected = (f, i) => {
        if (!!f.target.files) {
            const file = f.target.files[0];
            let insureeAttachments = [...this.state.insureeAttachments];
            insureeAttachments[i].filename = file.name;
            insureeAttachments[i].mime = file.type;
            this.setState({ insureeAttachments }, (e) => {
                var reader = new FileReader();
                reader.onloadend = (loaded) => {
                    this.addAttachment(btoa(loaded.target.result));
                };
                reader.readAsBinaryString(file);
            });
        }
    };

    formatFileName(a, i) {
        if (!!a.id)
            return (
                <Link onClick={(e) => this.download(a)} reset={this.state.reset}>
                    {a.filename || ""}
                </Link>
            );
        if (!!a.filename) return <i>{a.filename}</i>;
        return (
            <IconButton variant="contained" component="label">
                <FileIcon />
                <input type="file" style={{ display: "none" }} onChange={(f) => this.fileSelected(f, i)} />
            </IconButton>
        );
    }

    updateAttachment = (i, key, value) => {
        var state = { ...this.state };
        state.insureeAttachments[i][key] = value;
        state.updatedAttachments.add(i);
        state.reset = state.reset + 1;
        this.setState({ ...state });
    };

    cannotUpdate = (a, i) => i < this.state.insureeAttachments.length - 1 && !!this.state.insureeId && !a.id;

    render() {
        const {
            intl,
            classes,
            updateAttribute,
            readOnly = false,
            insuree,
            fetchingInsureeAttachments,
            errorInsureeAttachments
        } = this.props;
        const { open, insureeAttachments } = this.state;

        var headers = [
            "insureeAttachment.title",
            "insureeAttachment.date",
            "insureeAttachment.fileName"
        ];

        var itemFormatters = [
            (a, i) => this.cannotUpdate(a, i) ? (
                this.state.claimAttachments[i].title
            ) : (
                <TextInput
                    reset={this.state.reset}
                    value={this.state.insureeAttachments[i].title}
                    onChange={(v) => this.updateAttachment(i, "title", v)}
                />
            ),
            (a, i) => this.cannotUpdate(a, i) ? (
                this.state.claimAttachments[i].date
            ) : (
                <PublishedComponent
                    pubRef="core.DatePicker"
                    onChange={(v) => this.updateAttachment(i, "date", v)}
                    value={this.state.insureeAttachments[i].date}
                    reset={this.state.reset}
                />
            ),
            (a, i) => this.formatFileName(a, i),
        ];
        if (!readOnly) {
            headers.push("insureeAttachment.action");
            itemFormatters.push((a, i) => {
                if (!!a.id && this.state.updatedAttachments.has(i)) {
                    return (
                        <IconButton onClick={(e) => this.update(i)}>
                            <SaveIcon />
                        </IconButton>
                    );
                } else if (i < this.state.insureeAttachments.length - 1) {
                    return (
                        <IconButton onClick={(e) => this.delete(a, i)}>
                            <DeleteIcon />
                        </IconButton>
                    );
                }
                return null;
            });
        }

        return (
            <Dialog open={open} fullWidth={true}>
                <DialogTitle className={classes.dialogTitle}>
                    <FormattedMessage module="insuree" id="attachments.title" />
                </DialogTitle>
                <Divider />
                <DialogContent className={classes.dialogContent}>
                    <ProgressOrError progress={fetchingInsureeAttachments} error={errorInsureeAttachments} />
                    {!fetchingInsureeAttachments && !errorInsureeAttachments && (
                        <Table module="insuree" items={insureeAttachments} headers={headers} itemFormatters={itemFormatters} />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.onClose} color="primary">
                        <FormattedMessage module="claim" id="close" />
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

const mapStateToProps = (state) => ({
    confirmed: state.core.confirmed,
    submittingMutation: state.insuree.submittingMutation,
    mutation: state.insuree.mutation,
    fetchingInsureeAttachments: state.insuree.fetchingInsureeAttachments,
    fetchedInsureeAttachments: state.insuree.fetchedInsureeAttachments,
    errorInsureeAttachments: state.insuree.errorInsureeAttachments,
    insureeAttachments: state.insuree.insureeAttachments,
});

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(
        {
            fetchInsureeAttachments,
            downloadAttachment,
            deleteAttachment,
            createAttachment,
            updateAttachment,
            coreConfirm
        },
        dispatch,
    );
};


export default withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(AttachmentsDialog)))),
);
