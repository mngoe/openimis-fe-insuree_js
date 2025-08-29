import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useModulesManager, useTranslations, formatDateFromISO, historyPush, withHistory, decodeId } from "@openimis/fe-core";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { fetchSubFamilySummary } from "../actions";

const useStyles = makeStyles((theme) => ({
  header: theme.table.header,
  headerTitle: theme.table.title,
}));

const SUB_FAMILIES_HEADERS = [
  "insuree.SubFamiliesTable.photo",
  "insuree.SubFamiliesTable.InsuranceNo",
  "insuree.SubFamiliesTable.memberName",
  "insuree.SubFamiliesTable.gender",
  "insuree.SubFamiliesTable.dob",
  "insuree.SubFamiliesTable.phone",
];

const getPhotoUrl = (photo) => {
  if (photo?.photo) {
    return `data:image/png;base64,${photo.photo}`;
  }
  if (photo?.filename && photo?.folder) {
    return `/photos/${photo.folder}/${photo.filename}`;
  }
  return null;
};

const SubFamiliesTable = ({ familyUuid, familyId, history }) => {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations("insuree", modulesManager);
  const { subFamilies, fetchingSubFamilies, fetchedSubFamilies, errorSubFamilies, subFamiliesTotalCount } = useSelector((store) => store.insuree);
  const triedIdFilter = useRef(false);

  useEffect(() => {
    if (familyUuid) {
      dispatch(
        fetchSubFamilySummary(modulesManager, [
          `parent_Uuid: \"${familyUuid}\"`,
          "showHistory: true",
        ])
      );
    }
  }, [familyUuid, dispatch, modulesManager]);

  useEffect(() => {
    if (!familyUuid) return;
    if (!fetchedSubFamilies) return;
    const empty = !subFamilies || subFamilies.length === 0 || subFamiliesTotalCount === 0;
    if ((empty || !!errorSubFamilies) && !triedIdFilter.current && !!familyId) {
      triedIdFilter.current = true;
      const numericId = decodeId(familyId);
      if (numericId) {
        dispatch(
          fetchSubFamilySummary(modulesManager, [
            `parent_Id: ${numericId}`,
            "showHistory: true",
          ])
        );
      }
    }
  }, [fetchedSubFamilies, subFamilies, subFamiliesTotalCount, errorSubFamilies, familyUuid, dispatch, modulesManager]);

  if (fetchingSubFamilies) {
    return <div>{formatMessage("insuree.SubFamiliesTable.loading")}</div>;
  }


  if (!!errorSubFamilies) {
    return <div style={{ color: "#c62828" }}>{errorSubFamilies?.message || String(errorSubFamilies)}</div>;
  }
  if (!subFamilies?.length) {
    return <div>{formatMessage("insuree.SubFamiliesTable.noSubFamilies")}</div>;
  }

  return (
    <TableContainer component={Paper} style={{ marginTop: "20px" }}>
      <Table size="small">
        <TableHead className={classes.header}>
          <TableRow className={classes.headerTitle}>
            {SUB_FAMILIES_HEADERS.map((header) => (
              <TableCell key={header}>{formatMessage(header)}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {subFamilies.map((family) => (
            <TableRow
              key={family.uuid}
              hover
              style={{ cursor: "pointer" }}
              onClick={() =>
                historyPush(
                  modulesManager,
                  history,
                  "insuree.route.subFamilyOverview",
                  [family.uuid, familyUuid, family.headInsuree?.uuid],
                  true
                )
              }
              onDoubleClick={() =>
                historyPush(
                  modulesManager,
                  history,
                  "insuree.route.subFamilyOverview",
                  [family.uuid, familyUuid, family.headInsuree?.uuid],
                  true
                )
              }
            >
              <TableCell>
                <Avatar
                  src={getPhotoUrl(family.headInsuree?.photo)}
                  style={{ width: 70, height: 70 }}
                />
              </TableCell>
              <TableCell>{family.headInsuree?.chfId || "-"}</TableCell>
              <TableCell>
                {family.headInsuree
                  ? `${family.headInsuree.otherNames} ${family.headInsuree.lastName}`
                  : "-"}
              </TableCell>
              <TableCell>
                {family.headInsuree?.gender?.code
                  ? formatMessage(`insuree.InsureeGender.${family.headInsuree.gender.code}`)
                  : "-"}
              </TableCell>
              <TableCell>
                {family.headInsuree?.dob
                  ? formatDateFromISO(modulesManager, null, family.headInsuree.dob)
                  : "-"}
              </TableCell>
              <TableCell>{family.headInsuree?.phone || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default withHistory(SubFamiliesTable);
