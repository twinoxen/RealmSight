#if UNITY_ANDROID
using System.Threading.Tasks;
using UnityEngine;

namespace RealmSight.Platform
{
    public class AndroidPlatformAdapter : IPlatformAdapter
    {
        public bool SupportsDepthEnhancement => false; // Enable after ARCore Depth API integration

        public void TriggerLightHaptic()
        {
            if (SystemInfo.supportsVibration)
                Handheld.Vibrate();
        }

        public void TriggerMediumHaptic()
        {
            if (SystemInfo.supportsVibration)
                Handheld.Vibrate();
        }

        public async Task<bool> RequestCameraPermissionAsync()
        {
            if (!UnityEngine.Android.Permission.HasUserAuthorizedPermission(UnityEngine.Android.Permission.Camera))
            {
                UnityEngine.Android.Permission.RequestUserPermission(UnityEngine.Android.Permission.Camera);
                await Task.Delay(500); // brief wait for permission dialog
            }
            return UnityEngine.Android.Permission.HasUserAuthorizedPermission(UnityEngine.Android.Permission.Camera);
        }

        public bool HasCameraPermission() =>
            UnityEngine.Android.Permission.HasUserAuthorizedPermission(UnityEngine.Android.Permission.Camera);

        public void ShareImage(byte[] pngBytes, string filename)
        {
            // TODO: NativeShare or Android Intent plugin
            Debug.Log($"[Android] Share: {filename}");
        }

        public void PauseARSession() { }
        public void ResumeARSession() { }
    }
}
#endif
