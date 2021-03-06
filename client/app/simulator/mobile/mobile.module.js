const angular = require('angular')
const angularRouter = require('angular-ui-router')
const commonModule = require('../../common')

const devicePanelComponent = require('./device-panel.component')
const timeseriesChartComponent = require('./timeseries-chart.component')
const shareComponent = require('./share.component')
const mobileComponent = require('./mobile.component')
const mobileRoute = require('./mobile.route')

const mobile = angular.module('simulator.devices.mobile', [
  angularRouter,
  commonModule
])
  .component('devicePanel', devicePanelComponent)
  .component('timeseriesChart', timeseriesChartComponent)
  .component('share', shareComponent)
  .component('mobile', mobileComponent)
  .config(mobileRoute)

module.exports = mobile
