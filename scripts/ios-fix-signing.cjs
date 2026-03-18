/**
 * Post-sync script to ensure DEVELOPMENT_TEAM and CODE_SIGN_STYLE
 * are set in ALL build configurations of the Xcode project.
 * This fixes SPM package signing issues in CI (Appflow/Fastlane).
 */
const fs = require('fs');
const path = require('path');

const TEAM_ID = 'CASJQDDA7L';
const PBXPROJ_PATH = path.join(__dirname, '..', 'ios', 'App', 'App.xcodeproj', 'project.pbxproj');

function fixSigning() {
  if (!fs.existsSync(PBXPROJ_PATH)) {
    console.log('[ios-fix-signing] project.pbxproj not found, skipping.');
    return;
  }

  let content = fs.readFileSync(PBXPROJ_PATH, 'utf8');
  let modified = false;

  // Match every buildSettings block and ensure DEVELOPMENT_TEAM + CODE_SIGN_STYLE are present
  const buildSettingsRegex = /buildSettings\s*=\s*\{([^}]*)\}/g;
  
  content = content.replace(buildSettingsRegex, (match, inner) => {
    let newInner = inner;
    
    // Add or update DEVELOPMENT_TEAM
    if (/DEVELOPMENT_TEAM\s*=/.test(newInner)) {
      newInner = newInner.replace(/DEVELOPMENT_TEAM\s*=\s*[^;]*;/, `DEVELOPMENT_TEAM = ${TEAM_ID};`);
    } else {
      newInner = newInner.trimEnd() + `\n\t\t\t\tDEVELOPMENT_TEAM = ${TEAM_ID};\n\t\t\t`;
      modified = true;
    }

    // Add or update CODE_SIGN_STYLE  
    if (/CODE_SIGN_STYLE\s*=/.test(newInner)) {
      // Keep existing value (Manual or Automatic)
    } else {
      newInner = newInner.trimEnd() + `\n\t\t\t\tCODE_SIGN_STYLE = Automatic;\n\t\t\t`;
      modified = true;
    }

    const result = `buildSettings = {${newInner}}`;
    if (result !== match) modified = true;
    return result;
  });

  if (modified) {
    fs.writeFileSync(PBXPROJ_PATH, content, 'utf8');
    console.log('[ios-fix-signing] ✅ DEVELOPMENT_TEAM injected into all build configurations.');
  } else {
    console.log('[ios-fix-signing] ✅ All build configurations already have DEVELOPMENT_TEAM.');
  }
}

fixSigning();
