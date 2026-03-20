using UnityEngine;

namespace RealmSight.Platform
{
    public static class PlatformAdapterFactory
    {
        private static IPlatformAdapter _instance;

        public static IPlatformAdapter Instance
        {
            get
            {
                if (_instance != null) return _instance;

#if UNITY_IOS
                _instance = new IOSPlatformAdapter();
#elif UNITY_ANDROID
                _instance = new AndroidPlatformAdapter();
#else
                _instance = new EditorPlatformAdapter();
#endif
                return _instance;
            }
        }
    }

    /// <summary>Fallback for Unity Editor development.</summary>
    public class EditorPlatformAdapter : IPlatformAdapter
    {
        public bool SupportsDepthEnhancement => false;
        public void TriggerLightHaptic() => Debug.Log("[Editor] Light haptic");
        public void TriggerMediumHaptic() => Debug.Log("[Editor] Medium haptic");
        public System.Threading.Tasks.Task<bool> RequestCameraPermissionAsync() =>
            System.Threading.Tasks.Task.FromResult(true);
        public bool HasCameraPermission() => true;
        public void ShareImage(byte[] pngBytes, string filename) =>
            Debug.Log($"[Editor] Share: {filename}");
        public void PauseARSession() { }
        public void ResumeARSession() { }
    }
}
