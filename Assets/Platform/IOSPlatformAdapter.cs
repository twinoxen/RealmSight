#if UNITY_IOS
using System.Threading.Tasks;
using UnityEngine;

namespace RealmSight.Platform
{
    public class IOSPlatformAdapter : IPlatformAdapter
    {
        public bool SupportsDepthEnhancement =>
            SystemInfo.systemMemorySize >= 4096; // LiDAR devices have ≥4GB RAM

        public void TriggerLightHaptic() { /* TODO: native haptic via iOS plugin */ }
        public void TriggerMediumHaptic() { /* TODO: native haptic via iOS plugin */ }

        public Task<bool> RequestCameraPermissionAsync()
        {
            // AR Foundation handles camera permissions on session start
            return Task.FromResult(true);
        }

        public bool HasCameraPermission() => true; // AR session won't start without it

        public void ShareImage(byte[] pngBytes, string filename)
        {
            // TODO: NativeShare or iOS native share sheet plugin
            Debug.Log($"[iOS] Share: {filename}");
        }

        public void PauseARSession() { /* AR Foundation pause */ }
        public void ResumeARSession() { /* AR Foundation resume */ }
    }
}
#endif
