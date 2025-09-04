import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { TableContainer, TableHead, TableBody, Table, TableCell, TableRow, Paper, Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import { useModulesManager, useTranslations, formatDateFromISO, historyPush, withHistory } from "@openimis/fe-core";
import { fetchFamilyMembers } from "../actions";
import { DEFAULT, HYPHEN, MODULE_NAME } from "../constants";

const useStyles = makeStyles((theme) => ({
  footer: {
    marginInline: 16,
    marginBlock: 12,
  },
  tableContainer: {
    marginTop: theme.spacing(1),
  },
  cell: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: theme.table.title,
  actionCell: {
    width: 60,
  },
  header: theme.table.header,
}));

const FAMILY_MEMBERS_HEADERS = [
  "FamilyMembersTable.photo",
  "FamilyMembersTable.InsuranceNo",
  "FamilyMembersTable.memberName",
  "FamilyMembersTable.gender",
  "FamilyMembersTable.dob",
  "FamilyMembersTable.phone",
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

const FamilyMembersTable = ({ history }) => {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const { familyMembers, insuree } = useSelector((store) => store.insuree);
  const renderLastNameFirst = modulesManager.getConf(
    "fe-insuree",
    "renderLastNameFirst",
    DEFAULT.RENDER_LAST_NAME_FIRST,
  );

  useEffect(() => {
    if (!insuree) return;

    dispatch(fetchFamilyMembers(modulesManager, [`familyUuid: "${insuree?.family?.uuid}"`]));
  }, [insuree]);

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead className={classes.header}>
          <TableRow className={classes.headerTitle}>
            {FAMILY_MEMBERS_HEADERS.map((header) => (
              <TableCell className={classes.cell} key={header}> {formatMessage(header)} </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {familyMembers?.length !== 0 ? (
            familyMembers?.map((familyMember) => (
              <TableRow
                key={familyMember?.uuid}
                hover
                style={{ cursor: "pointer" }}
                onClick={() =>
                  historyPush(
                    modulesManager,
                    history,
                    "insuree.route.insuree",
                    [familyMember?.uuid, insuree?.family?.uuid],
                    true
                  )
                }
                onDoubleClick={() =>
                  historyPush(
                    modulesManager,
                    history,
                    "insuree.route.insuree",
                    [familyMember?.uuid, insuree?.family?.uuid],
                    true
                  )
                }
              >
                <TableCell>
                  <Avatar src={getPhotoUrl(familyMember?.photo)} style={{ width: 70, height: 70 }} />
                </TableCell>
                <TableCell> {familyMember?.chfId} </TableCell>
                <TableCell>
                  {renderLastNameFirst
                    ? `${familyMember?.lastName} ${familyMember?.otherNames}`
                    : `${familyMember?.otherNames} ${familyMember?.lastName}`}
                </TableCell>
                <TableCell>
                  {familyMember?.gender?.code
                    ? formatMessage(`insuree.InsureeGender.${familyMember.gender.code}`)
                    : HYPHEN}
                </TableCell>
                <TableCell>
                  {familyMember?.dob
                    ? formatDateFromISO(modulesManager, null, familyMember.dob)
                    : HYPHEN}
                </TableCell>
                <TableCell> {familyMember?.phone ?? HYPHEN} </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell className={classes.cell}> {formatMessage("insuree.FamilyMembersTable.noMembers")} </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default withHistory(FamilyMembersTable);
