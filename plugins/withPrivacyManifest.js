const { withDangerousMod, withXcodeProject } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');
const pbxFile = require('xcode/lib/pbxFile');

/**
 * Injects a PrivacyInfo.xcprivacy file into the iOS project.
 *
 * Required since Apple began enforcing Privacy Manifests for all new App Store
 * submissions (May 2024). Declares the "required reason APIs" the app accesses:
 *  - NSPrivacyAccessedAPICategoryUserDefaults  (expo-secure-store, react-native-mmkv)
 *  - NSPrivacyAccessedAPICategoryFileTimestamp  (expo-file-system cache management)
 */

const PRIVACY_MANIFEST = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>NSPrivacyTracking</key>
\t<false/>
\t<key>NSPrivacyTrackingDomains</key>
\t<array/>
\t<key>NSPrivacyCollectedDataTypes</key>
\t<array/>
\t<key>NSPrivacyAccessedAPITypes</key>
\t<array>
\t\t<dict>
\t\t\t<key>NSPrivacyAccessedAPIType</key>
\t\t\t<string>NSPrivacyAccessedAPICategoryUserDefaults</string>
\t\t\t<key>NSPrivacyAccessedAPITypeReasons</key>
\t\t\t<array>
\t\t\t\t<!-- CA92.1: app reads/writes only its own data via UserDefaults-backed APIs -->
\t\t\t\t<string>CA92.1</string>
\t\t\t</array>
\t\t</dict>
\t\t<dict>
\t\t\t<key>NSPrivacyAccessedAPIType</key>
\t\t\t<string>NSPrivacyAccessedAPICategoryFileTimestamp</string>
\t\t\t<key>NSPrivacyAccessedAPITypeReasons</key>
\t\t\t<array>
\t\t\t\t<!-- C617.1: access timestamps of files within the app's own container -->
\t\t\t\t<string>C617.1</string>
\t\t\t</array>
\t\t</dict>
\t</array>
</dict>
</plist>
`;

function withPrivacyManifest(config) {
  // Step 1: Write the PrivacyInfo.xcprivacy file into the iOS project tree
  config = withDangerousMod(config, [
    'ios',
    async (c) => {
      const projectRoot = c.modRequest.platformProjectRoot;
      const projectName = c.modRequest.projectName;
      const targetDir = path.join(projectRoot, projectName);
      const dest = path.join(targetDir, 'PrivacyInfo.xcprivacy');

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Always overwrite so the manifest stays in sync with this plugin
      fs.writeFileSync(dest, PRIVACY_MANIFEST, 'utf-8');
      return c;
    },
  ]);

  // Step 2: Register the file in the Xcode project so it's included in the build.
  //
  // We avoid project.addResourceFile() because it internally calls
  // correctForResourcesPath() which crashes when the project has no PBXGroup
  // named "Resources" — which is the case for Expo-generated projects (they
  // use a group named after the app, e.g. "ninhao", instead). We wire the file
  // up manually using the same low-level primitives addResourceFile would use.
  config = withXcodeProject(config, (c) => {
    const project = c.modResults;
    const projectName = c.modRequest.projectName;
    const relativePath = `${projectName}/PrivacyInfo.xcprivacy`;

    if (project.hasFile(relativePath)) {
      return c;
    }

    const groupKey = project.findPBXGroupKey({ name: projectName });
    const target = project.getFirstTarget();
    const targetUuid = target && target.uuid;
    if (!groupKey || !targetUuid) {
      // Bail quietly instead of crashing prebuild
      return c;
    }

    const file = new pbxFile(relativePath, { target: targetUuid });
    file.uuid = project.generateUuid();
    file.fileRef = project.generateUuid();
    file.target = targetUuid;

    project.addToPbxBuildFileSection(file);
    project.addToPbxFileReferenceSection(file);
    project.addToPbxResourcesBuildPhase(file);
    project.addToPbxGroup(file, groupKey);

    return c;
  });

  return config;
}

module.exports = withPrivacyManifest;
