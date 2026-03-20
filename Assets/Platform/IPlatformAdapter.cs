using System.Threading.Tasks;

namespace RealmSight.Platform
{
    /// <summary>
    /// Abstracts platform-specific capabilities so the rest of the codebase
    /// never calls ARKit or ARCore directly. iOS and Android each provide
    /// a concrete implementation; features that don't exist on a platform
    /// degrade gracefully.
    /// </summary>
    public interface IPlatformAdapter
    {
        // --- Haptics ---
        void TriggerLightHaptic();
        void TriggerMediumHaptic();

        // --- Camera permissions ---
        Task<bool> RequestCameraPermissionAsync();
        bool HasCameraPermission();

        // --- Share sheet ---
        void ShareImage(byte[] pngBytes, string filename);

        // --- Depth / mesh (iOS LiDAR, Android Depth API) ---
        /// <summary>True if the device supports depth enhancement for better plane detection.</summary>
        bool SupportsDepthEnhancement { get; }

        // --- AR session lifecycle ---
        void PauseARSession();
        void ResumeARSession();
    }
}
