using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ConnectionLoader : MonoBehaviour
{
    public static ConnectionLoader inst;
    public GameObject myScreen;

    private void Awake()
    {
        inst = this;
        myScreen.SetActive(true);
    }

    public void DisableScreen()
    {
        Debug.Log("disable screen");
        myScreen.SetActive(false);
        inst = null;
    }
}
