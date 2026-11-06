import { Config } from "@remotion/cli/config";
import { webpackOverride } from "./webpack-override.ts";

Config.overrideWebpackConfig(webpackOverride);
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
// H.264 in yuv420p, tagged BT.709: the default colour space writes
// full-range yuvj420p, which some players read with the wrong levels.
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");
Config.setColorSpace("bt709");
