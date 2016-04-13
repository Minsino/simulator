const _ = require('lodash')

const shareIcon = require('./images/share-icon.svg')
const rulesIcon = require('../navigation/images/rules-icon.svg')
const settingsIcon = require('../navigation/images/settings-icon.svg')
const xiLogo = require('./images/xi-logo.svg')

require('./device-demo.route.less')

/* @ngInject */
function deviceDemoRoute ($stateProvider) {
  $stateProvider.state('devices.device-demo', {
    url: '/:id/demo?header',
    template: `
      <div class="device-demo">
        <div class="left-side">
          <iphone-frame>
            <div class="navigation-header">
              <div class="logo">${xiLogo}</div>
            </div>
            <div class="icons">
              <a class="share" ng-click="device.toggleShareModal()"> ${shareIcon} </a>
            </div>
            <device-panel device="device.device"></device-panel>
            <share-modal link="device.shareLink" toggle="device.toggleShareModal()" ng-show="device.shareModal"></share-modal>
          </iphone-frame>
        </div>
        <div class="right-side">
          <div class="navigation">
            <div class="navigation-container">
              <div class="navigation-dropdown">
                <select
                  ng-model="device.navigation.selectedOption"
                  ng-change="device.navigation.selectedOption.navigate()"
                  ng-options="deviceLink.name for deviceLink in device.navigation.availableOptions track by deviceLink.device.deviceTemplateId">
                </select>
                <div class="simulate-button" ng-click="device.toggleSimulation()">
                  {{ device.simulate ? 'Stop' : 'Start' }} simulation
                </div>
              </div>
              <div class="navigation-items">
                <div class="navigation-item" ui-sref="rules" ui-sref-active="active">
                  <span class="navigation-item-icon">${rulesIcon}</span>
                  <span class="navigation-item-text">Rules</span>
                </div>
                <div class="navigation-item" ui-sref="settings" ui-sref-active="active">
                  <span class="navigation-item-icon">${settingsIcon}</span>
                  <span class="navigation-item-text">Settings</span>
                </div>
                <a class="navigation-item logo" href="https://app.demo.xively.com/" target="_blank">
                  <span class="navigation-item-icon">${xiLogo}</span>
                  <span class="navigation-item-text">CPM</span>
                </a>
              </div>
            </div>
          </div>
          <div class="device-controls">
            <div class="device-container">
              <div ng-repeat="(name, sensor) in ::device.config.sensors">
                <tooltip ng-if="sensor.tooltip"
                  options="sensor"
                  label="name"
                  value="device.device.sensors[name].numericValue"
                  update="device.update(name, value)">
                </tooltip>
                <div ng-if="sensor.widget" bind-html-compile="device.getHtml(sensor.widget)"></div>
              </div>
              <img class="device-image" src="/devices/images/{{ device.config.image }}" />
            </div>
            <div class="device-control-sliders" ng-if="device.sensorsNotConfigured">
              <div class="header row">
                <div class="channel-name">Channel name</div>
                <div class="control">Control</div>
                <div class="value">Value</div>
              </div>
              <div class="row" ng-repeat="(name, sensor) in device.sensorsNotConfigured">
                <div class="channel-name">{{ name }}</div>
                <div class="control">
                  <input type="range" min="0" max="100" ng-model="value" ng-init="value = 0" ng-change="device.update(name, value)">
                </div>
                <div class="value">
                  {{ value }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    controllerAs: 'device',
    resolve: {
      /* @ngInject */
      templates (devicesService) {
        return devicesService.getDeviceTemplates()
      },
      /* @ngInject */
      device ($stateParams, $state, devicesService) {
        const id = $stateParams.id
        return devicesService.getDevice(id)
          .catch(() => $state.go('devices'))
      }
    },
    /* @ngInject */
    controller ($log, $scope, $state, $location, device, templates, devicesService, socketService, DEVICES_CONFIG) {
      device.template = templates[device.deviceTemplateId]
      this.config = DEVICES_CONFIG[device.template.name]
      if (this.config) {
        this.sensorsNotConfigured = _.omit(device.sensors, Object.keys(this.config.sensors))
        if (!Object.keys(this.sensorsNotConfigured).length) {
          this.sensorsNotConfigured = null
        }
      }
      this.device = device

      // template navigation options
      devicesService.getDevices().then((devices) => {
        const availableOptions = _.map((templates), (template, id) => ({
          name: template.name,
          device: _.find(devices, { deviceTemplateId: id }),
          navigate () {
            $state.go('devices.device-demo', { id: this.device.id })
          }
        })).filter((option) => option.device)

        const selectedOption = _.find(availableOptions, { name: device.template.name })

        this.navigation = {
          availableOptions,
          selectedOption
        }
      })

      // simulate
      this.simulate = false
      this.toggleSimulation = () => {
        this.simulate = !this.simulate
        if (this.simulate) {
          socketService.startSimulation(device)
        } else {
          socketService.stopSimulation(device)
        }
      }

      // update sensor value
      this.update = device.update

      // get html for a widget element
      this.getHtml = (widget) => {
        return `<${widget} device="device.device"></${widget}>`
      }

      this.shareLink = $location.absUrl().replace(/\/demo.*/, '?navigation=0')
      this.shareModal = false
      this.toggleShareModal = () => {
        this.shareModal = !this.shareModal
      }
    }
  })
}

module.exports = deviceDemoRoute