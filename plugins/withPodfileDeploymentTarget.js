const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Ensures all CocoaPods targets have IPHONEOS_DEPLOYMENT_TARGET >= 15.1
 * to avoid Xcode warnings for pods like SDWebImage (9.0).
 */
function withPodfileDeploymentTarget(config) {
  return withDangerousMod(config, [
    'ios',
    async (c) => {
      const podfilePath = path.join(c.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf-8');

      const fix = `
    # Fix pods with outdated iOS deployment target (e.g. SDWebImage 9.0)
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1' if config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].to_f < 15.0
      end
    end`;

      if (contents.includes('Fix pods with outdated iOS deployment target')) {
        return c;
      }

      // Find the closing ) of react_native_post_install (last ) before "  end")
      const postInstallIdx = contents.indexOf('post_install do |installer|');
      if (postInstallIdx === -1) return c;
      const rnpiIdx = contents.indexOf('react_native_post_install', postInstallIdx);
      if (rnpiIdx === -1) return c;
      const closingParen = contents.indexOf(')', rnpiIdx);
      if (closingParen === -1) return c;
      // Find the ) that closes the react_native_post_install( call (may span multiple lines)
      let depth = 0;
      let lastParen = -1;
      for (let i = rnpiIdx + 'react_native_post_install'.length; i < contents.length; i++) {
        if (contents[i] === '(') depth++;
        else if (contents[i] === ')') {
          depth--;
          if (depth === 0) {
            lastParen = i;
            break;
          }
        }
      }
      if (lastParen === -1) return c;
      const endOfLine = contents.indexOf('\n', lastParen);
      const endMatch = contents.slice(endOfLine + 1).match(/^(\s+)end\s*\n/);
      if (!endMatch) {
        return c;
      }
      const indent = endMatch[1];
      const insertAt = endOfLine + 1;
      const deploymentFix = `
${indent}# Fix pods with outdated iOS deployment target (e.g. SDWebImage 9.0)
${indent}installer.pods_project.targets.each do |target|
${indent}  target.build_configurations.each do |config|
${indent}    config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1' if config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].to_f < 15.0
${indent}  end
${indent}end
`;
      contents = contents.slice(0, insertAt) + deploymentFix + contents.slice(insertAt);
      fs.writeFileSync(podfilePath, contents);
      return c;
    },
  ]);
}

module.exports = withPodfileDeploymentTarget;
