using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

[System.Serializable]
public class Notification
{
    public string Message;
    public float Duration;
    public bool Interrupt;
    public Color Color;
    public bool Turn;

    public Notification(string message, float duration, bool interrupt, Color color)
    {
        this.Message = message;
        this.Duration = duration;
        this.Interrupt = interrupt;
        this.Color = color;
        this.Turn = false;
    }

    public Notification(string message, float duration, bool interrupt, Color color, bool turn)
    {
        this.Message = message;
        this.Duration = duration;
        this.Interrupt = interrupt;
        this.Color = color;
        this.Turn = turn;
    }
}

public class NotificationManager : MonoBehaviour
{
    //public Text notificationsText;
    public TextMeshProUGUI notificationsText;
    public TextMeshProUGUI myTurnText;
    public GameObject turnImage;
    
    public float duration;

    public float interMessageDelay = .5f;
    
    public Color color;

    public Color myTurnColor;

    public Image image;

    public bool isNotifying = false;

    public bool interruptMessages;

    public static NotificationManager instance;

    public List<Notification> Notifications;

    private void Awake()
    {
        if (instance == null)
        {
            instance = this;
        }
        else
        {
            Destroy(gameObject);
        }
        
        image = GetComponent<Image>();
        color = image.color;
    }
    
    // Update is called once per frame
    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Space))
        {
            var newNotification = new Notification("Hello", 3, false, Color.blue);
            addNotification(newNotification);
        }
        if (Input.GetKeyDown(KeyCode.A))
        {
            var newNotification = new Notification("Interrupting Message", 2, true, Color.red);
            addNotification(newNotification);
        }

        // if (Input.GetKeyDown(KeyCode.Tab))
        // {
        //     myTurn();
        // }
    }

    public void myTurn(bool state)
    {
        //myTurnText.enabled = state;
        turnImage.SetActive(state);
    }
    
    
    public bool addNotification(Notification newNotification)
    {
        if (newNotification.Turn)
        {
            myTurn(true);
            return true;
        }
        
        // if nofication is meant to interrupt, add it the top of the list and start notifying
        if (newNotification.Interrupt)
        {
            StopAllCoroutines();
            Notifications.Insert(0, newNotification);
            StartCoroutine(notify());
            return true;
        }
        
        // add regular notification to the end of the list
        Notifications.Add(newNotification);
        
        // if not already notifying, start notifying
        if (!isNotifying)
        {
            StartCoroutine(notify());
        }
        return Notifications.Count == 1;
    }

    private IEnumerator notify()
    {
        isNotifying = true;
        while(Notifications.Count > 0)
        {
            // print(Notifications.Count);
            var currentNotification = Notifications[0];
            
            yield return false;
            notificationsText.text = currentNotification.Message;
            notificationsText.color = currentNotification.Color;
            yield return new WaitForSeconds(currentNotification.Duration);

            image.color = color;
            
            // wait for completion of message to remove it
            Notifications.RemoveAt(0);
            yield return false;

            if (Notifications.Count > 0)
            {
                notificationsText.text = "";
                yield return new WaitForSeconds(interMessageDelay);
            }

            yield return false;
        } 

        // print("Notifications finished");
        isNotifying = false;
        yield return true;
    }

    public void clearNotifications()
    {
        StopAllCoroutines();
        Notifications = new List<Notification>();
    }
}
