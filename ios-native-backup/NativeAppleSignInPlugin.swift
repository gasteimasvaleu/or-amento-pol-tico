import Foundation
import Capacitor
import AuthenticationServices

@objc(NativeAppleSignInPlugin)
public class NativeAppleSignInPlugin: CAPPlugin, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {

    var call: CAPPluginCall?

    @objc func authorize(_ call: CAPPluginCall) {
        self.call = call
        let request = ASAuthorizationAppleIDProvider().createRequest()
        request.requestedScopes = [.fullName, .email]
        let controller = ASAuthorizationController(authorizationRequests: [request])
        controller.delegate = self
        controller.presentationContextProvider = self
        DispatchQueue.main.async {
            controller.performRequests()
        }
    }

    public func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        return self.bridge!.viewController!.view.window!
    }

    public func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential else {
            call?.reject("Invalid credential type")
            return
        }
        guard let identityTokenData = credential.identityToken,
              let identityToken = String(data: identityTokenData, encoding: .utf8) else {
            call?.reject("Missing identity token")
            return
        }
        guard let authCodeData = credential.authorizationCode,
              let authorizationCode = String(data: authCodeData, encoding: .utf8) else {
            call?.reject("Missing authorization code")
            return
        }
        var result: [String: Any] = [
            "identityToken": identityToken,
            "authorizationCode": authorizationCode
        ]
        result["givenName"] = credential.fullName?.givenName as Any? ?? NSNull()
        result["familyName"] = credential.fullName?.familyName as Any? ?? NSNull()
        result["email"] = credential.email as Any? ?? NSNull()
        call?.resolve(result)
    }

    public func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        if let authError = error as? ASAuthorizationError, authError.code == .canceled {
            call?.reject("User cancelled", "1001")
        } else {
            call?.reject(error.localizedDescription)
        }
    }
}
