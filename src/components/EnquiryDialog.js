import React, { useEffect, Fragment, useRef, useMemo } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";

import { 
  Dialog, 
  Button, 
  DialogActions, 
  DialogContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Typography
 } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import {
  formatMessage,
  formatMessageWithValues,
  Contributions,
  Error,
  ProgressOrError,
  withModulesManager,
  withHistory,
  historyPush,
} from "@openimis/fe-core";
import { fetchInsuree, fetchSubFamilySummary, clearSubFamily, clearInsuree, fetchFamily} from "../actions";
import InsureeSummary from "./InsureeSummary";
import FamilyMembersTable from "./FamilyMembersTable";

const useStyles = makeStyles((theme) => ({
  summary: {
    marginBottom: 32,
  },
  tableContainer: {
    marginTop: 16,
  },
  tableRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  tableHeader: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  tableCell: {
    color: theme.palette.primary.contrastText,
  }
}));

const EnquiryDialog = ({
  intl,
  modulesManager,
  fetchInsuree,
  fetchSubFamilySummary,
  fetchFamily,
  clearSubFamily,
  clearInsuree,
  fetching,
  fetched,
  insuree,
  subfamilies,
  error,
  onClose,
  open,
  chfid,
  match,
  history,
}) => {
  const classes = useStyles();
  const prevMatchUrl = useRef(null);
  const currentPath = history?.location?.pathname;

  const getFamilyUuidFromPath = (path) => {
    if (!path) return null;
    const familyOverviewMatch = path.match(/\/insuree\/families\/familyOverview\/([^/]+)/);
    return familyOverviewMatch ? familyOverviewMatch[1] : null;
  };

  const refreshCurrentFamily = () => {
    const familyUuid = getFamilyUuidFromPath(currentPath);
    if (familyUuid) {
      fetchFamily(modulesManager, familyUuid);
    }
  };

  const isInsideInsureeView = () => {
    // Check if we are in an insured detail view
    return currentPath?.includes('/insuree/insurees/insuree/') || 
           currentPath?.includes('/subfamilies/subFamilyOverview/');
  };

  const handleClose = () => {
    clearSubFamily();
    clearInsuree();
    
    // If the dialog is open and we are in an insured detail view
    if (open && isInsideInsureeView()) {
      // Refresh the current page
      window.location.reload();
    } else if (!isInsideInsureeView()) {
      // If we are not in an insured detail view, refresh the current family
      refreshCurrentFamily();
    }
    
    // Always close the dialog
    onClose();
  };

  const findPolygamousFamily = (family) => {
    if (family?.familyType?.code === 'P') return family;
    if (family?.parent?.familyType?.code === 'P') return family.parent;
    return null;
  };

  const isPolygamousHead = () => {
    const isHead = 
      insuree?.head || 
      insuree?.family?.headInsuree?.id === insuree?.id ||
      insuree?.id === insuree?.family?.parent?.headInsuree?.id;
    
    const polygamousFamily = findPolygamousFamily(insuree?.family);
    return isHead && !!polygamousFamily;
  };

  const isPolygamousHeadWithSubFamilies = () => {
    return insuree?.id === insuree?.family?.parent?.headInsuree?.id &&
           insuree?.family?.parent?.familyType?.code === 'P' &&
           insuree?.id !== insuree?.family?.headInsuree?.id;
  };

  const getSubFamiliesList = () => {
    if (!subfamilies || !isPolygamousHead()) return [];
    const polygamousFamily = findPolygamousFamily(insuree?.family);
    return subfamilies.filter(subfamily => 
      subfamily.parent?.id === polygamousFamily?.id
    );
  };

  const onDoubleClick = (subfamily, newTab = false) => {
    if (!subfamily?.uuid || !subfamily?.headInsuree?.uuid) {
      console.error("Subfamily or head insuree data is missing");
      return;
    }

    // Get parent family UUID
    let parentFamilyUuid = insuree?.family?.parent?.uuid;
    
    // If no parent, use current family as parent
    if (!parentFamilyUuid && insuree?.family?.uuid) {
      parentFamilyUuid = insuree.family.uuid;
    }
    
    // Check if we can get parent UUID from current URL
    const currentPathMatch = history?.location?.pathname.match(
      /\/subfamilies\/subFamilyOverview\/([^/]+)\/([^/]+)\/([^/]+)/
    );
    
    if (!parentFamilyUuid && currentPathMatch?.[2]) {
      parentFamilyUuid = currentPathMatch[2];
    }

    if (!parentFamilyUuid) {
      console.error("Unable to determine parent family UUID");
      return;
    }

    // Perform navigation first
    try {
      const route = `/insuree/subfamilies/subFamilyOverview/${subfamily.uuid}/${parentFamilyUuid}/${subfamily.headInsuree.uuid}`;
      
      if (newTab) {
        // Open in a new tab
        const url = new URL(window.location.origin + route);
        window.open(url, '_blank');
      } else {
        // Normal navigation with state to trigger refresh
        history.push(route, { shouldRefresh: true });
      }
    } catch (error) {
      console.error("[EnquiryDialog] Navigation Error:", error);
    } finally {
      // Always close the dialog after navigation
      handleClose();
    }
  };

  useEffect(() => {
    // Reset error state when opening the dialog
    if (open) {
      clearInsuree();
      clearSubFamily();
      
      // Only fetch if we have a valid chfid and it's different from current insuree
      if (chfid && insuree?.id !== chfid) {
        fetchInsuree(modulesManager, chfid);
      }
    }

    // Handle URL changes and navigation
    if (!!match?.url) {
      // If URL changed and we have a refresh flag, reload the page
      if (match.url !== prevMatchUrl.current) {
        if (history.location.state?.shouldRefresh) {
          // Clear the state to prevent unnecessary refreshes
          history.replace({ ...history.location, state: undefined });
          // Force a re-render of the current route
          window.location.reload();
        } else if (!open) {
          // Only close if dialog is not supposed to be open
          handleClose();
        }
      }
      
      // Update previous URL reference
      prevMatchUrl.current = match.url;
    }
  }, [open, chfid, match?.url, history.location.state]);

  useEffect(() => {
    if (insuree?.family?.uuid) {
      if (insuree.family?.parent?.uuid) {
        fetchSubFamilySummary(modulesManager, { parent_Uuid: insuree.family.parent.uuid });
      } else {
        fetchSubFamilySummary(modulesManager, { parent_Uuid: insuree.family.uuid });
      }
    }
  }, [insuree?.family?.uuid]);

  // Handle error state
  const renderError = () => {
    if (error) {
      return (
        <Error
          error={{
            code: formatMessage(intl, "insuree", "error.loading"),
            detail: error.message || formatMessage(intl, "insuree", "error.unknown")
          }}
        />
      );
    }
    
    if (fetched && !insuree) {
      return (
        <Error
          error={{
            code: formatMessage(intl, "insuree", "notFound"),
            detail: formatMessageWithValues(intl, "insuree", "chfIdNotFound", { chfid }),
          }}
        />
      );
    }
    
    return null;
  };

  return (
    <Dialog maxWidth="xl" fullWidth open={open} onClose={handleClose}>
      <DialogContent>
        <ProgressOrError progress={fetching} error={error} />
        {renderError()}
        {!fetching && insuree && (
          <Fragment>
            <InsureeSummary modulesManager={modulesManager} insuree={insuree} className={classes.summary} />
            {isPolygamousHeadWithSubFamilies() && (
              <>
                <Typography variant="h6" style={{ marginBottom: '16px' }}>
                  {formatMessage(intl, "insuree", "SubFamilies.title")} ({getSubFamiliesList().length})
                </Typography>
                <Paper className={classes.tableContainer}>
                  <Table>
                    <TableHead>
                      <TableRow className={classes.tableHeader}>
                        <TableCell className={classes.tableCell}>{formatMessage(intl, "insuree", "familySummaries.insuranceNo")}</TableCell>
                        <TableCell className={classes.tableCell}>{formatMessage(intl, "insuree", "familySummaries.lastName")}</TableCell>
                        <TableCell className={classes.tableCell}>{formatMessage(intl, "insuree", "familySummaries.otherNames")}</TableCell>
                        <TableCell className={classes.tableCell}>{formatMessage(intl, "insuree", "familySummaries.email")}</TableCell>
                        <TableCell className={classes.tableCell}>{formatMessage(intl, "insuree", "familySummaries.phone")}</TableCell>
                        <TableCell className={classes.tableCell}>{formatMessage(intl, "insuree", "familySummaries.dob")}</TableCell>
                        <TableCell className={classes.tableCell}>{formatMessage(intl, "insuree", "familySummaries.photo")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(() => {
                        const subfamilies = getSubFamiliesList();
                        console.log("Subfamilies data:", subfamilies);
                        return subfamilies.map((subfamily) => {
                          console.log(`Subfamily ${subfamily.uuid} headInsuree:`, subfamily.headInsuree);
                          if (subfamily.headInsuree?.photo) {
                            console.log(`Photo data for ${subfamily.headInsuree.chfId}:`, {
                              hasPhoto: !!subfamily.headInsuree.photo,
                              hasPhotoData: !!subfamily.headInsuree.photo.photo,
                              photoType: typeof subfamily.headInsuree.photo.photo,
                              photoLength: subfamily.headInsuree.photo.photo?.length
                            });
                          }
                          return (
                            <TableRow 
                              key={subfamily.uuid}
                              className={classes.tableRow}
                              onDoubleClick={() => onDoubleClick(subfamily)}
                            >
                              <TableCell>{subfamily.headInsuree?.chfId || ''}</TableCell>
                              <TableCell>{subfamily.headInsuree?.lastName || ''}</TableCell>
                              <TableCell>{subfamily.headInsuree?.otherNames || ''}</TableCell>
                              <TableCell>{subfamily.headInsuree?.email || ''}</TableCell>
                              <TableCell>{subfamily.headInsuree?.phone || ''}</TableCell>
                              <TableCell>{subfamily.headInsuree?.dob || ''}</TableCell>
                              <TableCell>
                                {subfamily.headInsuree?.photo ? (
                                  <img
                                    src={`data:image/jpeg;base64,${subfamily.headInsuree.photo.photo}`}
                                    alt=""
                                    style={{
                                      width: '80px',
                                      height: '80px',
                                      objectFit: 'fill',
                                      borderRadius: '80%',
                                    }}
                                    onError={(e) => {
                                      console.error("Error loading image for", subfamily.headInsuree?.chfId);
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <Typography>No Photo</Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        });
                      })()}
                    </TableBody>
                  </Table>
                </Paper>
              </>
            )}
            {!isPolygamousHeadWithSubFamilies() && (
              <FamilyMembersTable insuree={insuree} history={history} />
            )}
            <Contributions
              contributionKey="insuree.EnquiryDialog"
              insuree={insuree}
              disableSelection
              hideAddPolicyButton
            />
          </Fragment>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          {formatMessage(intl, "insuree", "close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const mapStateToProps = (state) => ({
  fetching: state.insuree.fetchingInsuree,
  fetched: state.insuree.fetchedInsuree,
  insuree: state.insuree.insuree,
  subfamilies: state.insuree.subFamilies,
  error: state.insuree.errorInsuree,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchInsuree, fetchSubFamilySummary, fetchFamily, clearSubFamily, clearInsuree}, dispatch);
export default withModulesManager(withHistory(connect(mapStateToProps, mapDispatchToProps)(injectIntl(EnquiryDialog))));
