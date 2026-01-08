import { RXOperation } from "flinker"
import { RestApi, RestApiError, Runnable } from "../RestApi"

export class UploadFileCmd implements Runnable {
  private readonly api: RestApi
  private readonly path: string
  private readonly file: File
  private readonly fileName: string

  constructor(api: RestApi, path: string, file: File, fileName: string) {
    this.api = api
    this.path = path
    this.file = file
    this.fileName = fileName
  }

  run(): RXOperation<any, RestApiError> {
    const op = new RXOperation<any, RestApiError>()
    this.startLoading(op).catch((e: RestApiError) => {
      op.fail(e)
    })
    return op
  }

  private async startLoading(op: RXOperation<any, RestApiError>) {
    console.log('UploadFileCmd:startLoading, f=', this.file)
    const formData = new FormData();
    formData.append('file', this.file, this.fileName)

    //DO NOT USE THESE HEADERS: { 'Content-Type': 'multipart/form-data' }
    //let browser to add 'Content-Type': 'multipart/form-data; boundary=----WebKitFormBou...' 
    const headers = {}

    const [response, body] = await this.api.sendRequest('POST', this.path, formData, headers)
    if (response?.ok) {
      op.success(body)
    } else {
      await this.api.handlerError(response)
    }
  }
}

