using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

[System.Serializable]
public struct menuPairs 
{
    // public KeyValuePair<GameObject, GameObject> pairs;
    public GameObject button;
    public GameObject menuObject;
}

public class tabbedMenus : MonoBehaviour
{
    [Header("Options Panel")] public GameObject optionsCanvas;

    [Header("Keep Last Opened Menu Up?")] public bool rememberLastMenu = false;
    
    [Header("Options")]
    public List<menuPairs> menuPairList;

    // Start is called before the first frame update
    void Start()
    {
        foreach (menuPairs pair in menuPairList)
        {
            pair.button?.AddComponent<Button>();
            pair.button?.GetComponent<Button>().onClick.AddListener(()=>bringToFront(pair));
        }
        
        optionsCanvas.SetActive(false);
    }
    

    public void bringToFront(menuPairs selectedPair)
    {
        foreach (menuPairs pair in menuPairList)
        {
            pair.menuObject?.SetActive((pair.menuObject == selectedPair.menuObject) ? true : false);
        }
    }

    public void toggleOptionsCanvas(bool open)
    {
        optionsCanvas.SetActive(open);
        if (!rememberLastMenu)
        {
            bringToFront(menuPairList[0]);
        }
    }
}
