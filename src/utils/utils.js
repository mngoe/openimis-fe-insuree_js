import _ from "lodash";

export function insureeLabel(insuree) {
  if (!insuree) return "";
  if(insuree.email == "newhivuser_XM7dw70J0M3N@gmail.com"){
    return `${
      !!insuree.chfId ? ` (${insuree.chfId})` : ""
    }`;
  }else{
    return `${_.compact([insuree.lastName, insuree.otherNames]).join(" ")}${
      !!insuree.chfId ? ` (${insuree.chfId})` : ""
    }`;
  }
}

export function familyLabel(family) {
  return !!family && !!family.headInsuree ? insureeLabel(family.headInsuree) : "";
}
