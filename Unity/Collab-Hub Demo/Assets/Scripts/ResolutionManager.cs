using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// Determines the device resolution and adjusts canvas accordingly
/// </summary>
public class ResolutionManager : MonoBehaviour
{
    private void Awake()
    {
        Debug.Log("Screen resolution: " + Screen.currentResolution);

        int canvasCount = 0;
        foreach (CanvasScaler canvas in FindObjectsOfType<CanvasScaler>())
        {
            //if(Screen.currentResolution.width < 2000)
            //    canvas.referenceResolution = new Vector2(Screen.currentResolution.width, Screen.currentResolution.height);

            if (Screen.currentResolution.width / Screen.currentResolution.height <= 1.5F)
            {
                float height = Screen.currentResolution.height * 1920F / Screen.currentResolution.width;
                canvas.referenceResolution = new Vector2(1920F, height);
            }
            else
            {
                float height = Screen.currentResolution.height * 2220F / Screen.currentResolution.width;
                canvas.referenceResolution = new Vector2(2220F, height);
            }

            canvasCount++;
        }
        Debug.Log("Canvases altered: " + canvasCount);
    }
}
