import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const provider = new PxToTailwindSidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      PxToTailwindSidebarProvider.viewType,
      provider,
    ),
  );
}

export function deactivate() {}

class PxToTailwindSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "pxToTailwind.sidebarView";

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tailwind REM Converter</title>
    <style>
      html {
        font-size: 18px;
      }
     
      #pxInput {
        background-color: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        border: 1px solid var(--vscode-input-border);
        padding: 4px;
		margin: 8px 0 ;
		display: block;
      }
      #message {
        display: none;
        color: var(--vscode-inputValidation-infoBackground);
        margin-top: 10px 0;
      }
      .resultItem {
        cursor: pointer;
        margin: 5px 0;
      }
    </style>
  </head>
  <body>
    <label for="pxInput">Enter Pixel Value:</label>
    <input type="number" id="pxInput" oninput="convertPxToTailwind()" />
    <div id="resultBox">
      <div
        id="pixelBox"
        class="resultItem"
        onclick="copyToClipboard('pixelBox')"
      ></div>
      <div
        id="tailwindBox"
        class="resultItem"
        onclick="copyToClipboard('tailwindBox')"
      ></div>
      <div
        id="remBox"
        class="resultItem"
        onclick="copyToClipboard('remBox')"
      ></div>
    </div>
    <div id="message">Copied to clipboard!</div>

    <script>
      const conversionTable = [
        { px: 0, tw: "0", rem: "0rem" },
        { px: 1, tw: "px", rem: "1px" },
        { px: 4, tw: "1", rem: "0.25rem" },
        { px: 8, tw: "2", rem: "0.5rem" },
        { px: 12, tw: "3", rem: "0.75rem" },
        { px: 16, tw: "4", rem: "1rem" },
        { px: 20, tw: "5", rem: "1.25rem" },
        { px: 24, tw: "6", rem: "1.5rem" },
        { px: 32, tw: "8", rem: "2rem" },
        { px: 40, tw: "10", rem: "2.5rem" },
        { px: 48, tw: "12", rem: "3rem" },
        { px: 64, tw: "16", rem: "4rem" },
        { px: 80, tw: "20", rem: "5rem" },
        { px: 96, tw: "24", rem: "6rem" },
        { px: 128, tw: "32", rem: "8rem" },
        { px: 160, tw: "40", rem: "10rem" },
        { px: 192, tw: "48", rem: "12rem" },
        { px: 224, tw: "56", rem: "14rem" },
        { px: 256, tw: "64", rem: "16rem" },
      ];

      function convertPxToTailwind() {
        const pxValue = document.getElementById("pxInput").value;
        if (pxValue === "") {
          document.getElementById("pixelBox").innerText = "";
          document.getElementById("tailwindBox").innerText = "";
          document.getElementById("remBox").innerText = "";
          return;
        }
        const closestMatch = conversionTable.reduce((prev, curr) =>
          Math.abs(curr.px - pxValue) < Math.abs(prev.px - pxValue)
            ? curr
            : prev,
        );
        document.getElementById("pixelBox").innerText = "Pixels: " + pxValue + "px";
        document.getElementById(
          "tailwindBox",
        ).innerText = "Tailwind: " + closestMatch.tw ;
        document.getElementById(
          "remBox",
        ).innerText = "REM: " + closestMatch.rem;
      }

      function copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        const textToCopy = element.innerText.split(": ")[1];
        navigator.clipboard.writeText(textToCopy).then(() => {
          const message = document.getElementById("message");
          message.style.display = "block";
          setTimeout(() => {
            message.style.display = "none";
          }, 2000);
        });
      }
    </script>
  </body>
</html>`;
  }
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
