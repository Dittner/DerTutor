import { RXObservableValue } from "flinker";
import { globalContext } from "../../../App";
import { ViewModel } from "../ViewModel";
import { UrlKeys } from "../../../app/URLNavigator";
import { Interactor } from "../Interactor";
import { log } from "../../../app/Logger";
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
    let logs = ''
    logs += 'API_URL: ' + globalContext.server.baseUrl + '\n'
    logs += 'Connecting to the server...\n'
    this.$logs.value = logs
    await globalContext.server.ping().asAwaitable
    logs += this.hasConnection() ? 'Success\n' : 'No connection\n'
    this.$logs.value = logs
    if (this.hasConnection()) {
      this.$logs.value = ''
      this.navigator.updateWith({}) //reload page without clearing url
    } else {
      await delay(5000)
      this.startConnecting()
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