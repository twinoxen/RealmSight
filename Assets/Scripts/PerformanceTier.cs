using UnityEngine;

namespace RealmSight
{
    /// <summary>
    /// Detected at startup. Lite mode reduces quality to hit 30FPS on low-end Android.
    /// </summary>
    public enum PerformanceTierLevel { Full, Lite }

    public static class PerformanceTier
    {
        public static PerformanceTierLevel Current { get; private set; }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        public static void Detect()
        {
            // Lite mode on Android devices with < 4GB RAM
            bool isLowTier = Application.platform == RuntimePlatform.Android
                             && SystemInfo.systemMemorySize < 3900;

            Current = isLowTier ? PerformanceTierLevel.Lite : PerformanceTierLevel.Full;
            Debug.Log($"[PerformanceTier] {Current} (RAM: {SystemInfo.systemMemorySize}MB)");
        }

        public static int MaxActiveModels =>
            Current == PerformanceTierLevel.Lite ? 15 : 50;

        public static bool UseFullLOD =>
            Current == PerformanceTierLevel.Full;

        public static float ScanResolutionScale =>
            Current == PerformanceTierLevel.Lite ? 0.5f : 1.0f;
    }
}
