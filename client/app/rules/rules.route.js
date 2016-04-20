require('./rules.less')

/* @ngInject */
function rulesRoute ($stateProvider) {
  $stateProvider.state('rules', {
    url: '/rules',
    redirectTo: 'rules.list',
    template: '<ui-view></ui-view>'
  })

  $stateProvider.state('rules.list', {
    url: '',
    template: `
      <section class="rules container">
        <header>
          <h1 class="title">Rules List</h1>
          <a class="pull-right new-button" ui-sref="rules.create">
            <button type="button" class="button primary">New Rule</button>
          </a>
        </header>

        <div class="content">
          <div class="no-rules" ng-if="!rules.rules.length">
            <h3>Your rules will appear here</h3>
            <p>At the moment you haven't created any rules. You can make one by
              <a href="" ui-sref="rules.create">clicking here</a>.</p>
          </div>

          <div ng-if="rules.rules.length">
            <ul class="rule-list">
              <li ng-repeat="rule in rules.rules track by $index">
                <a class="rule-name" ui-sref="rules.edit({ruleId: rule.id})">{{rule.ruleConfig.name}}</a>
                <div class="pull-right">
                  <a ui-sref="rules.edit({ruleId: rule.id})">
                    <button type="button" class="button primary-outline">View rule</button>
                  </a>
                  <button class="button delete-outline" ng-click="rules.removeRule(rule.id)">Remove rule</button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    `,
    resolve: {
      rules: (rulesService) => {
        return rulesService.getRules()
          .then((result) => result.data)
      }
    },
    controllerAs: 'rules',
    controller (rules, rulesService) {
      this.rules = rules

      this.removeRule = (ruleId) => {
        rulesService.removeRule(ruleId)
          .then(() => {
            rulesService.getRules()
              .then((result) => {
                this.rules = result.data
              })
          })
      }
    }
  })
}

module.exports = rulesRoute
