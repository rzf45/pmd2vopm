const mode = document.getElementById("mode");
const input = document.getElementById("input");
const output = document.getElementById("output");
const convert = document.getElementById("convert");
const switchBtn = document.getElementById("switch-mode");
const dt2 = document.getElementById("dt2");
const templatePMD = "@NUM ALGO FB 1AR 1DR 1SR 1RR 1SL 1TL 1KS 1ML 1DT 1AMS 2AR 2DR 2SR 2RR 2SL 2TL 2KS 2ML 2DT 2AMS 3AR 3DR 3SR 3RR 3SL 3TL 3KS 3ML 3DT 3AMS 4AR 4DR 4SR 4RR 4SL 4TL 4KS 4ML 4DT 4AMS";
const templatePMDDT2 = "@NUM ALGO FB 1AR 1DR 1SR 1RR 1SL 1TL 1KS 1ML 1DT 1DT2 1AMS 2AR 2DR 2SR 2RR 2SL 2TL 2KS 2ML 2DT 2DT2 2AMS 3AR 3DR 3SR 3RR 3SL 3TL 3KS 3ML 3DT 3DT2 3AMS 4AR 4DR 4SR 4RR 4SL 4TL 4KS 4ML 4DT 4DT2 4AMS";
const templateVOPM = "@:0"
  + "\nLFO: 0 0 0 0 0"
  + "\nCH: 64 FB ALGO 0 0 120 0"
  + "\nM1: 1AR 1DR 1SR 1RR 1SL 1TL 1KS 1ML 1DT 1DT2 1AMS"
  + "\nC1: 2AR 2DR 2SR 2RR 2SL 2TL 2KS 2ML 2DT 2DT2 2AMS"
  + "\nM2: 3AR 3DR 3SR 3RR 3SL 3TL 3KS 3ML 3DT 3DT2 3AMS"
  + "\nC2: 4AR 4DR 4SR 4RR 4SL 4TL 4KS 4ML 4DT 4DT2 4AMS";

output.addEventListener("click", function () {
  output.select();
  if (output.value.trim().length === 0) {
    return;
  }

  if (navigator.clipboard) {
    navigator.clipboard.writeText(output.value)
      .then(() => {
        alert("Copied!");
      })
      .catch(() => {
        document.execCommand("copy");
        alert("Copied!");
      });
  }
  else if (document.execCommand) {
    document.execCommand("copy");
    alert("Copied!");
  }
});

convert.addEventListener("click", function () {
  const value = input.value;
  const isPMD = mode.value === "0";
  const isDT2 = dt2.checked;
  const result = (() => {
    if (isPMD) {
      let result = value.replace(/\s+/g, " ").replaceAll("\n", "").trim().split(" ");
      let algoAndFb = result.splice(0, 3).slice(1);
      /** @type {string[][]} */
      let op = splitArray(result, isDT2 ? 11 : 10).map(a => a.map(b => parseInt(b).toString()));
      let vopm = templateVOPM.slice().replace("ALGO", algoAndFb[0]).replace("FB", algoAndFb[1]);
      if (isDT2) {
        op.forEach(([AR, DR, SR, RR, SL, TL, KS, ML, DT, DT2, AMS], chI) => {
          vopm = vopm.replace((chI+1) + "AR", AR).replace((chI+1) + "DR", DR).replace((chI+1) + "SR", SR).replace((chI+1) + "RR", RR).replace((chI+1) + "SL", SL).replace((chI+1) + "TL", TL).replace((chI+1) + "KS", KS).replace((chI+1) + "ML", ML).replace((chI+1) + "DT", DT).replace((chI+1) + "DT2", DT2).replace((chI+1) + "AMS", AMS);
        });
      }
      else {
        vopm = op.forEach(([AR, DR, SR, RR, SL, TL, KS, ML, DT, AMS], chI) => {
          vopm.replace((chI+1) + "AR", AR).replace((chI+1) + "DR", DR).replace((chI+1) + "SR", SR).replace((chI+1) + "RR", RR).replace((chI+1) + "SL", SL).replace((chI+1) + "TL", TL).replace((chI+1) + "KS", KS).replace((chI+1) + "ML", ML).replace((chI+1) + "DT", DT).replace((chI+1) + "AMS", AMS);
        });
      }
      return vopm;
    }
    else {
      let vopmParams = normalizeVOPM(value);
      let algoAndFb = [vopmParams["CH"][2], vopmParams["CH"][1]];
      let pmd = (isDT2 ? templatePMDDT2 : templatePMD).slice().replace("ALGO", algoAndFb[0]).replace("FB", algoAndFb[1]).replace("NUM", Math.floor(Math.random() * 256).toString());
      let op = [vopmParams["M1"].slice(),vopmParams["C1"].slice(),vopmParams["M2"].slice(),vopmParams["C2"].slice()];
      op.forEach(([AR, DR, SR, RR, SL, TL, KS, ML, DT, DT2, AMS], chI) => {
        pmd = pmd.replace((chI+1) + "AR", AR).replace((chI+1) + "DR", DR).replace((chI+1) + "SR", SR).replace((chI+1) + "RR", RR).replace((chI+1) + "SL", SL).replace((chI+1) + "TL", TL).replace((chI+1) + "KS", KS).replace((chI+1) + "ML", ML).replace((chI+1) + "DT", DT).replace((chI+1) + "AMS", AMS);
        if (isDT2) pmd = pmd.replace((chI+1) + "DT2", DT2);
      });
      return pmd;
    }
  })();

  output.value = result;
});

switchBtn.addEventListener("click", function () {
  input.value = "";
  output.value = "";
  mode.value = mode.value === "0" ? "1" : "0";
  if (mode.value === "1") {
    convert.innerText = "VOPM => PMD";
  }
  else {
    convert.innerText = "PMD => VOPM";
  }
});

dt2.addEventListener("change", function (e) {
  const { checked } = e.target;
  if (checked) {
    localStorage.setItem("pmd2vopm::dt2-flag", "on");
  }
  else {
    localStorage.setItem("pmd2vopm::dt2-flag", "off");
  }
});

function splitArray(array, itemsPerSplit) {
  const result = [];
  let currentIndex = 0;

  while (currentIndex < array.length) {
    result.push(array.slice(currentIndex, currentIndex + itemsPerSplit));
    currentIndex += itemsPerSplit;
  }

  return result;
}

function normalizeVOPM(vopm) {
  const regex = /(?:CH|M1|C1|M2|C2):\s*((?:\d+\s*)+)/g;
  const matches = {};
  
  let match;
  while ((match = regex.exec(vopm)) !== null) {
    const numbers = match[1].trim().split(/\s+/).map(Number);
    const key = match[0].split(":")[0];
    matches[key] = numbers;
  }
  
  return matches;
}
