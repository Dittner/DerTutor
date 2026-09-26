import { RXObservableValue } from "flinker";
import { globalContext } from "../../../App";
import { ViewModel } from "../ViewModel";
import { UrlKeys } from "../../../app/URLNavigator";
import { Interactor } from "../Interactor";
import { log, logWarn } from "../../../app/Logger";
import { delay } from "../../../app/Utils";

export interface ServerConnectionState {
  hasConnection?: boolean
  logs?: string
}

export class ServerConnectionVM extends ViewModel<ServerConnectionState> {
  readonly $logs = new RXObservableValue('')
  constructor() {
    const interactor = new ServerConnectionInteractor()
    super('connection', interactor)
  }

  protected override stateDidChange(state: ServerConnectionState) {
    if (!this.isActive) return
  }

  override activate(): void {
    super.activate()
    this.startConnecting()
  }

  async startConnecting() {

    try {
      let logs = ''
      logs += 'API_URL: ' + globalContext.server.baseUrl + '\n'
      logs += 'Connecting to the server...\n'
      this.$logs.value = logs
      await globalContext.server.ping().asAwaitable
      this.$logs.value += this.hasConnection() ? 'Success\n' : 'No connection\n'
      this.$logs.value += 'Authenticating...\n'
      await this.loadUserInfo()
      this.navigator.updateWith({}) //reload page without clearing url
    } catch (e: any) {
      const msg = 'Server connection is failed:' + e
      this.$logs.value += msg
      logWarn(msg)
      await delay(5000)
      this.startConnecting()
    }
  }

  private async loadUserInfo() {
    try {
      this.ctx.$user.value = await this.server.loadCurrentUser().asAwaitable
      const msg = 'User is authenticated: ' + this.ctx.$user.value.username
      this.$logs.value += msg + '\n'
      log(msg)
    } catch (e: any) {
      const msg = 'User not loaded, err:' + e
      this.$logs.value += msg + '\n'
      logWarn(msg)
    }
  }

  hasConnection() {
    return this.ctx.server.$isServerAvailable.value
  }
}

class ServerConnectionInteractor extends Interactor<ServerConnectionState> {
  constructor() {
    super()
    log('new ServerConnectionInteractor')
    //nothing to load
  }

  override async load(state: ServerConnectionState, keys: UrlKeys) { }

}