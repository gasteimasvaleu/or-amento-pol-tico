import Foundation
import Capacitor
import AuthenticationServices

@objc(NativeAppleSignInPlugin)
public class NativeAppleSignInPlugin: CAPPlugin, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {

    var call: CAPPluginCall?
    var authController: ASAuthorizationController?

    @objc func authorize(_ call: CAPPluginCall) {
        self.call = call
        let request = ASAuthorizationAppleIDProvider().createRequest()
        request.requestedScopes = [.fullName, .email]
        let controller = ASAuthorizationController(authorizationRequests: [request])
        controller.delegate = self
        controller.presentationContextProvider = self
        self.authController = controller
        DispatchQueue.main.async {
            controller.performRequests()
        }
    }

    public func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        // Use UIWindowScene API (required for iPadOS 26+)
        if let windowScene = UIApplication.shared.connectedScenes
            .compactMap({ $0 as? UIWindowScene })
            .first(where: { $0.activationState == .foregroundActive }),
           let window = windowScene.windows.first(where: { $0.isKeyWindow }) ?? windowScene.windows.first {
            NSLog("[NativeAppleSignIn] presentationAnchor via connectedScenes: \(window)")
            return window
        }
        // Fallback: bridge viewController window
        if let window = self.bridge?.viewController?.view.window {
            NSLog("[NativeAppleSignIn] presentationAnchor via bridge: \(window)")
            return window
        }
        // Last resort — avoid force unwrap
        let fallback = UIApplication.shared.windows.first(where: { $0.isKeyWindow }) ?? UIApplication.shared.windows.first ?? UIWindow()
        NSLog("[NativeAppleSignIn] presentationAnchor fallback: \(fallback)")
        return fallback
    }

    public func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        defer { self.authController = nil }
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
        defer { self.authController = nil }
        NSLog("[NativeAppleSignIn] authorizationController error: \(error)")
        if let authError = error as? ASAuthorizationError, authError.code == .canceled {
            call?.reject("User cancelled", "1001")
        } else {
            call?.reject(error.localizedDescription)
        }
    }
}
